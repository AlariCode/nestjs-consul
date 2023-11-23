import { IConsulConnection } from './consul-connection.interface';
import { ModuleMetadata } from '@nestjs/common';

export interface IConsulConfig<T = any> {
	keys?: IConsulKeys<T>[];
	updateCron?: string;
	connection: IConsulConnection;
}

export interface IConsulAsyncConfig<T = any> extends Pick<ModuleMetadata, 'imports'> {
	useFactory?: (...args: any[]) => Promise<IConsulConfig<T>> | IConsulConfig<T>;
	inject?: any[];
}

export interface IConsulKeys<T = any> {
	key: keyof T;
	required?: boolean;
}
