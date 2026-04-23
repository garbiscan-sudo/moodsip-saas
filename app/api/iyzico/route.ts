export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdmin } from '@/lib/supabase/server'
import { v4 as uuid } from 'uuid'

const PLANS = {
  monthly: { price: process.env.NEXT_PUBLIC_PRICE_MONTHLY || '299', label: 'Aylık' },
  yearly:  { price: process.env.NEXT_PUBLIC_PRICE_YEARLY  || '2490', label: 'Yıllık' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { barId, plan, buyerEmail, buyerName, buyerSurname, buyerPhone,
            cardHolderName, cardNumber, expireMonth, expireYear, cvc } = body

    const p = PLANS[plan as 'monthly' | 'yearly']
    const conversationId = uuid()

    const payload = {
      locale: 'tr', conversationId,
      price: p.price, paidPrice: p.price, currency: 'TRY',
      installment: '1',
      basketId: `BASKET_${conversationId}`,
      paymentChannel: 'WEB', paymentGroup: 'SUBSCRIPTION',
      paymentCard: { cardHolderName, cardNumber, expireMonth, expireYear, cvc, registerCard: '0' },
      buyer: {
        id: `BUYER_${buyerEmail}`, name: buyerName, surname: buyerSurname,
        gsmNumber: buyerPhone, email: buyerEmail, identityNumber: '11111111111',
        lastLoginDate: new Date().toISOString().slice(0,19).replace('T',' '),
        registrationDate: new Date().toISOString().slice(0,19).replace('T',' '),
        registrationAddress: 'Türkiye', ip: '85.34.78.112', city: 'Istanbul', country: 'Turkey',
      },
      shippingAddress: { contactName: `${buyerName} ${buyerSurname}`, city: 'Istanbul', country: 'Turkey', address: 'Türkiye' },
      billingAddress:  { contactName: `${buyerName} ${buyerSurname}`, city: 'Istanbul', country: 'Turkey', address: 'Türkiye' },
      basketItems: [{ id: `MOODSIP_${plan.toUpperCase()}`, name: `MoodSip ${p.label}`, category1: 'Yazılım', category2: 'SaaS', itemType: 'VIRTUAL', price: p.price }],
    }

    const crypto = await import('crypto')
    const apiKey    = process.env.IYZICO_API_KEY!
    const secretKey = process.env.IYZICO_SECRET_KEY!
    const baseUrl   = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    const uri       = '/payment/auth'
    const randomStr = Math.random().toString(36).substring(2)
    const pkiStr    = Object.entries(payload).map(([k,v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join('&')
    const hashStr   = apiKey + randomStr + secretKey + pkiStr
    const hash      = crypto.createHash('sha1').update(hashStr).digest('base64')

    const res = await fetch(`${baseUrl}${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `IYZWS ${apiKey}:${hash}`,
        'x-iyzi-rnd':    randomStr,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (data.status === 'success') {
      const supabase = createAdmin()
      const now = new Date()
      const periodEnd = new Date(now)
      plan === 'monthly' ? periodEnd.setMonth(periodEnd.getMonth()+1) : periodEnd.setFullYear(periodEnd.getFullYear()+1)
      await supabase.from('bars').update({ subscription_status: 'active', subscription_plan: plan, current_period_end: periodEnd.toISOString() }).eq('id', barId)
      return NextResponse.json({ success: true, paymentId: data.paymentId })
    } else {
      return NextResponse.json({ success: false, error: data.errorMessage || 'Ödeme başarısız' }, { status: 400 })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 })
  }
}