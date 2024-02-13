
export interface CreateSessionResponse {
    hash: string;
    session_id: string;
    expires_on: Date;
  }
  
export interface VerifySessionRequest {
    signature: string;
    session_id: string;
  }
