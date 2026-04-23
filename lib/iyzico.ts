// ─────────────────────────────────────────────
//  MoodSip — İyzico Entegrasyonu
//  Ajans hesabı üzerinden abonelik yönetimi
// ─────────────────────────────────────────────
import Iyzipay from 'iyzipay'

export const iyzipay = new Iyzipay({
  apiKey:    process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri:       process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
})

// Fiyatlar (TL, kuruş cinsinden string — İyzico kuruş ister)
export const PLANS = {
  monthly: {
    label:        'Aylık',
    price:        process.env.NEXT_PUBLIC_PRICE_MONTHLY || '299',
    priceDisplay: `₺${process.env.NEXT_PUBLIC_PRICE_MONTHLY || '299'}/ay`,
    referenceCode: 'MOODSIP_MONTHLY',
  },
  yearly: {
    label:        'Yıllık',
    price:        process.env.NEXT_PUBLIC_PRICE_YEARLY || '2490',
    priceDisplay: `₺${process.env.NEXT_PUBLIC_PRICE_YEARLY || '2490'}/yıl`,
    referenceCode: 'MOODSIP_YEARLY',
    savingsLabel: '%30 tasarruf',
  },
}

// Tek seferlik ödeme (sonra aboneliğe geçiş için)
export async function createPayment(params: {
  plan:           'monthly' | 'yearly'
  conversationId: string
  buyerEmail:     string
  buyerName:      string
  buyerSurname:   string
  buyerPhone:     string
  buyerIp:        string
  cardHolderName: string
  cardNumber:     string
  expireMonth:    string
  expireYear:     string
  cvc:            string
}): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  const plan   = PLANS[params.plan]
  const price  = plan.price

  return new Promise((resolve) => {
    iyzipay.payment.create(
      {
        locale:           Iyzipay.LOCALE.TR,
        conversationId:   params.conversationId,
        price:            price,
        paidPrice:        price,
        currency:         Iyzipay.CURRENCY.TRY,
        installment:      '1',
        basketId:         `BASKET_${params.conversationId}`,
        paymentChannel:   Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup:     Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
        paymentCard: {
          cardHolderName: params.cardHolderName,
          cardNumber:     params.cardNumber,
          expireMonth:    params.expireMonth,
          expireYear:     params.expireYear,
          cvc:            params.cvc,
          registerCard:   '0',
        },
        buyer: {
          id:                  `BUYER_${params.buyerEmail}`,
          name:                params.buyerName,
          surname:             params.buyerSurname,
          gsmNumber:           params.buyerPhone,
          email:               params.buyerEmail,
          identityNumber:      '11111111111', // Sandbox için
          lastLoginDate:       new Date().toISOString().slice(0, 19).replace('T', ' '),
          registrationDate:    new Date().toISOString().slice(0, 19).replace('T', ' '),
          registrationAddress: 'Türkiye',
          ip:                  params.buyerIp,
          city:                'Istanbul',
          country:             'Turkey',
        },
        shippingAddress: {
          contactName: `${params.buyerName} ${params.buyerSurname}`,
          city:        'Istanbul',
          country:     'Turkey',
          address:     'Türkiye',
        },
        billingAddress: {
          contactName: `${params.buyerName} ${params.buyerSurname}`,
          city:        'Istanbul',
          country:     'Turkey',
          address:     'Türkiye',
        },
        basketItems: [
          {
            id:        plan.referenceCode,
            name:      `MoodSip ${plan.label} Abonelik`,
            category1: 'Yazılım',
            category2: 'SaaS',
            itemType:  Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
            price:     price,
          },
        ],
      },
      (err: unknown, result: { status: string; paymentId?: string; errorMessage?: string }) => {
        if (err) {
          resolve({ success: false, error: String(err) })
        } else if (result.status === 'success') {
          resolve({ success: true, paymentId: result.paymentId })
        } else {
          resolve({ success: false, error: result.errorMessage || 'Ödeme başarısız' })
        }
      }
    )
  })
}
