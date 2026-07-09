export type UserRole = 'consumer' | 'agent' | 'adjuster' | 'admin' | 'insurer';

export type PolicyType = 'daily_boda' | 'daily_market' | 'seasonal_crop' | 'health_cover' | 'sme_fire' | 'funeral' | 'education_savings' | 'life_cover';

export type PolicyStatus = 'active' | 'expired' | 'claimed' | 'cancelled';

export type ClaimStatus = 'pending' | 'ai_review' | 'human_review' | 'approved' | 'settled' | 'rejected';

export interface User {
  id: string;
  phone_number: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Policy {
  id: string;
  user_id: string;
  policy_type: PolicyType;
  premium_amount: number;
  coverage_amount: number;
  status: PolicyStatus;
  start_date: string;
  end_date: string;
  blockchain_tx_hash: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Claim {
  id: string;
  policy_id: string;
  user_id: string;
  description: string | null;
  status: ClaimStatus;
  ai_confidence_score: number | null;
  ai_analysis: Record<string, unknown> | null;
  image_urls: string[];
  verified_metadata: Record<string, unknown> | null;
  payout_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface LedgerLog {
  id: string;
  entity_type: 'premium_collection' | 'claim_payout' | 'policy_issuance';
  entity_id: string;
  tx_hash: string;
  network: string;
  block_number: number | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface UssdSession {
  sessionId: string;
  phoneNumber: string;
  text: string;
  serviceCode: string;
  network: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  policy_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  mpesa_receipt: string | null;
  created_at: string;
}

export interface ProductDefinition {
  type: PolicyType;
  name: string;
  description: string;
  dailyPremium: number;
  coverageAmount: number;
  icon: string;
  color: string;
}
