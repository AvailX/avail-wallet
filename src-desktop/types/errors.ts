export enum AvailErrorType {
	Internal,
	External,
	Database,
	LocalStorage,
	NotFound,
	InvalidData,
	Validation,
	Network,
	File,
	Node,
	SnarkVm,
	Unauthorized,
}

export type AvailError = {
	error_type: AvailErrorType;
	internal_msg: string;
	external_msg: string;
};
