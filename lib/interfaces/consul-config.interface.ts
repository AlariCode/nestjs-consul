import { IConsulConnection } from './consul-connection.interface';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface IConsulConfig {
	keys?: IConsulKeys[];
	updateCron?: string;
	connection: IConsulConnection;
}

export interface IConsulAsyncConfig extends Pick<ModuleMetadata, 'imports'> {
		useFactory?: (...args: any[]) => Promise<IConsulConfig> | IConsulConfig;
		inject?: any[];
}

export interface IConsulKeys {
	key: string;
	required?: boolean;
}
