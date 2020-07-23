export interface IConsulConnection {
	protocol: 'http' | 'https';
	host: string;
	port: number;
	token: string;
}
