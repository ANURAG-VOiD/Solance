export interface User {
  id: string;
  wallet_address: string;
  created_at: string;
}

export interface RequestNonceResponse {
  message: string;
  expires_at: string;
}

export interface VerifyResponse {
  token: string;
  user: User;
}

export interface AuthSession {
  token: string;
  user: User;
}
