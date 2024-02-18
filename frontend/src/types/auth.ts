
export type CreateSessionResponse = {
	hash: string;
	session_id: string;
	expires_on: Date;
};

export type VerifySessionRequest = {
	signature: string;
	session_id: string;
};
