// Hand-maintained types mirroring supabase/migrations/*.sql.
// Regenerate with `supabase gen types typescript` once a live project exists.

export type UserRole = "buyer" | "seller" | "admin" | "compliance" | "mediator";
export type KycStatus = "not_required" | "required" | "pending" | "approved" | "rejected" | "needs_more_info";
export type AccountStatus = "active" | "disabled" | "suspended" | "pending";

export type ContractStatus =
  | "draft" | "waiting_for_seller" | "seller_joined" | "seller_accepted"
  | "waiting_for_deposit" | "deposit_pending" | "blockchain_confirming" | "deposit_confirmed"
  | "admin_reviewing" | "active_escrow" | "awaiting_delivery" | "delivery_completed"
  | "release_requested" | "admin_reviewing_release" | "released" | "completed"
  | "cancelled" | "refunded" | "disputed" | "under_mediation" | "resolved" | "closed";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded" | "released";
export type ContractType = "crypto" | "real_estate";
export type ParticipantRole = "buyer" | "seller" | "escrow_officer" | "mediator" | "compliance" | "observer";
export type MessageType = "buyer" | "seller" | "admin" | "mediator" | "compliance" | "system";
export type DisputeStatus = "open" | "under_review" | "mediation" | "settlement_proposed" | "resolved" | "closed";
export type CryptoAsset = "BTC" | "ETH" | "USDT" | "USDC" | "SOL" | "XRP" | "LTC";

export type AdminActionType =
  | "mark_deposit_confirmed" | "mark_pending" | "mark_payment_failed" | "mark_paid" | "mark_unpaid"
  | "mark_complete" | "mark_incomplete" | "release_funds" | "refund_funds" | "pause_contract"
  | "cancel_contract" | "lock_contract" | "unlock_contract" | "open_dispute" | "assign_mediator"
  | "request_documents" | "add_internal_note" | "verify_user" | "unverify_user" | "enable_user"
  | "disable_user" | "suspend_user" | "reactivate_user" | "approve_kyc" | "reject_kyc"
  | "request_more_kyc_info" | "create_contract" | "edit_contract" | "reset_password"
  | "join_chat" | "send_official_message" | "propose_settlement" | "close_dispute";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  account_status: AccountStatus;
  is_verified: boolean;
  kyc_status: KycStatus;
  risk_flags: string[];
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface EscrowContract {
  id: string;
  contract_number: string;
  contract_type: ContractType;
  title: string;
  description: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  escrow_officer_id: string | null;
  mediator_id: string | null;
  crypto_asset: CryptoAsset | null;
  amount_crypto: number | null;
  amount_usd: number;
  payment_network: string | null;
  deposit_address: string | null;
  transaction_hash: string | null;
  confirmations: number;
  status: ContractStatus;
  payment_status: PaymentStatus;
  kyc_requirement: KycStatus;
  delivery_terms: string | null;
  inspection_period: string | null;
  release_conditions: string | null;
  dispute_terms: string | null;
  is_locked: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractInvite {
  id: string;
  contract_id: string;
  token: string;
  seller_email: string;
  invited_by: string | null;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  status: string;
  created_at: string;
}

export interface ContractMessage {
  id: string;
  contract_id: string;
  sender_id: string | null;
  message_type: MessageType;
  body: string;
  is_official: boolean;
  read_by: string[];
  created_at: string;
}

export interface Dispute {
  id: string;
  contract_id: string;
  opened_by: string | null;
  mediator_id: string | null;
  status: DisputeStatus;
  reason: string;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: UserRole | null;
  action: AdminActionType;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string;
  ip_address: string | null;
  created_at: string;
}

export interface KycSubmission {
  id: string;
  user_id: string;
  status: KycStatus;
  id_document_url: string | null;
  passport_url: string | null;
  national_id_url: string | null;
  proof_of_address_url: string | null;
  selfie_url: string | null;
  liveness_check_url: string | null;
  compliance_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  updated_at: string;
}

// Minimal Database shape so @supabase/ssr generics compile.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
