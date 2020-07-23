import { IConsulConnection } from './consul-connection.interface';

export interface IConsulConfig {
	keys?: IConsulKeys[];
	updateCron?: string;
	connection: IConsulConnection;
}

export interface IConsulKeys {
	key: string;
	required?: boolean;
}
