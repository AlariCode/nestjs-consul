import { IConsulConfig, IConsulKeys } from './interfaces/consul-config.interface';
import { HttpService, Logger } from '@nestjs/common';
import { IConsulResponse } from './interfaces/consul-response.interface';
import { schedule } from 'node-cron';

export class ConsulService<T> {
	public configs: T = Object.create({});
	private readonly consulURL: string;
	private readonly keys: IConsulKeys<T>[] | undefined;
	private readonly token: string;

	constructor({ connection, keys, updateCron }: IConsulConfig<T>, private readonly httpService: HttpService) {
		this.consulURL = `${connection.protocol}://${connection.host}:${connection.port}/v1/kv/`;
		this.keys = keys;
		this.token = connection.token;
		this.planUpdate(updateCron);
	}

	private async getKeyFromConsul(k: IConsulKeys) {
		try {
			const { data } = await this.httpService
				.get<IConsulResponse[]>(`${this.consulURL}${String(k.key)}`, {
					headers: {
						'X-Consul-Token': this.token,
					},
				}).toPromise();
			return data;
		} catch (e) {
			if (k.required) {
				throw new Error(`Не найден ключ ${String(k.key)}`)
			}
			Logger.warn(`Не найден ключ ${String(k.key)}`);
			return null;
		}
	}

	private updateConfig(value: any, key: IConsulKeys) {
		try {
			const result = value !== null ? Buffer.from(value, 'base64').toString() : value;
			this.configs[key.key] = JSON.parse(result);
		} catch (e) {
			const msg = `Invalid JSON value in ${String(key.key)}`;
			if (key.required) {
				throw new Error(msg);
			}
			Logger.warn(msg);
		}
	}

	public async update(): Promise<void> {
		if(!this.keys) {
			return;
		}
		for (const k of this.keys) {
			const data = await this.getKeyFromConsul(k);
			if (data) {
				this.updateConfig(data[0].Value, k)
			}
		}
	}

	public async set<T>(key: string, value: T): Promise<boolean> {
		try {
			const { data } = await this.httpService
				.put<boolean>(`${this.consulURL}${key}`, value, {
					headers: {
						'X-Consul-Token': this.token,
					},
				})
				.toPromise();
			return data;
		} catch (e) {
			Logger.error(e);
		}
	}

	public async get<T>(key: string): Promise<T> {
		try {
			const { data } = await this.httpService
				.get<boolean>(`${this.consulURL}${key}`, {
					headers: {
						'X-Consul-Token': this.token,
					},
				})
				.toPromise();
			const result = Buffer.from(data[0].Value, 'base64').toString();
			return JSON.parse(result);
		} catch (e) {
			Logger.error(e);
		}
	}

	public async delete(key: string): Promise<boolean> {
		try {
			const { data } = await this.httpService
				.delete<boolean>(`${this.consulURL}${key}`, {
					headers: {
						'X-Consul-Token': this.token,
					},
				})
				.toPromise();
			return data;
		} catch (e) {
			Logger.error(e);
		}
	}

	private planUpdate(updateCron: string | undefined) {
		if (updateCron) {
			schedule(updateCron, async () => {
				this.update()
			});
		}
	}
}
