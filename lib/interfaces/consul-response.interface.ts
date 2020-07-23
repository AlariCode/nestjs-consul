export interface IConsulResponse {
	LockIndex: number;
	Key: string;
	Flags: number;
	Value: string;
	CreateIndex: number;
	ModifyIndex: number;
}
