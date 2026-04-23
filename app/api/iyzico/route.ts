import { NextRequest, NextResponse } from 'next/server'
import { createPayment } from '@/lib/iyzico'
import { createAdmin } from '@/lib/supabase/server'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { barId, plan, ...rest } = body

    const buyerIp =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    const result = await createPayment({
      plan,
      conversationId: uuid(),
      buyerIp,
      ...rest,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    // Ödeme başarılı → Supabase'i güncelle
    const supabase = createAdmin()
    const now      = new Date()
    const periodEnd = new Date(now)
    plan === 'monthly'
      ? periodEnd.setMonth(periodEnd.getMonth() + 1)
      : periodEnd.setFullYear(periodEnd.getFullYear() + 1)

    await supabase.from('bars').update({
      subscription_status: 'active',
      subscription_plan:   plan,
      current_period_end:  periodEnd.toISOString(),
    }).eq('id', barId)

    // Log event
    await supabase.from('iyzico_events').insert({
      bar_id:     barId,
      event_type: 'payment_success',
      payload:    { paymentId: result.paymentId, plan },
      processed:  true,
    })

    return NextResponse.json({ success: true, paymentId: result.paymentId })
  } catch (err) {
    console.error('İyzico payment error:', err)
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 })
  }
}
