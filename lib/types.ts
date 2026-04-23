// ─────────────────────────────────────────────
//  MoodSip SaaS — Global Types
// ─────────────────────────────────────────────

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired'
export type SubscriptionPlan   = 'monthly' | 'yearly'

export interface Bar {
  id:                     string
  owner_id:               string
  name:                   string
  slug:                   string
  tagline:                string | null
  logo_url:               string | null
  primary_color:          string
  bg_color:               string
  subscription_status:    SubscriptionStatus
  subscription_plan:      SubscriptionPlan | null
  iyzico_subscription_id: string | null
  iyzico_customer_id:     string | null
  trial_ends_at:          string | null
  current_period_end:     string | null
  created_at:             string
  updated_at:             string
}

export interface Cocktail {
  id:            string
  bar_id:        string
  name:          string
  description:   string | null
  ingredients:   string[]
  image_url:     string | null
  tags:          string[]
  is_active:     boolean
  display_order: number
  created_at:    string
  updated_at:    string
}

export interface QuizQuestion {
  id:            string
  bar_id:        string
  question_text: string
  emoji:         string
  display_order: number
  is_active:     boolean
  created_at:    string
  options?:      QuestionOption[]
}

export interface QuestionOption {
  id:            string
  question_id:   string
  text:          string
  subtext:       string | null
  tags:          string[]
  display_order: number
}

// İyzico ödeme isteği tipi
export interface IyzicoPaymentRequest {
  barId:          string
  plan:           SubscriptionPlan
  buyerName:      string
  buyerSurname:   string
  buyerEmail:     string
  buyerPhone:     string
  buyerAddress:   string
  buyerCity:      string
  buyerCountry:   string
  cardHolderName: string
  cardNumber:     string
  expireMonth:    string
  expireYear:     string
  cvc:            string
}
