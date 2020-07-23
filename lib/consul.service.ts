import { IConsulConfig, IConsulKeys } from './interfaces/consul-config.interface';
import { HttpService, Logger } from '@nestjs/common';
import { IConsulResponse } from './interfaces/consul-response.interface';
import { schedule } from 'node-cron';
import { type } from 'os';

export class ConsulService<T> {
	public configs: T = Object.create({});
	private readonly consulURL: string;
	private readonly keys: IConsulKeys[] | undefined;
	private readonly token: string;

	constructor({ connection, keys, updateCron }: IConsulConfig, private readonly httpService: HttpService) {
		this.consulURL = `${connection.protocol}://${connection.host}:${connection.port}/v1/kv/`;
		this.keys = keys;
		this.token = connection.token;
		this.planUpdate(updateCron);
	}

	public async update(): Promise<void> {
		if(!this.keys) {
			return;
		}
		for (const k of this.keys) {
			try {
				const { data } = await this.httpService
					.get<IConsulResponse[]>(`${this.consulURL}${k.key}`, {
						headers: {
							'X-Consul-Token': this.token,
						},
					}).toPromise();
				const result = Buffer.from(data[0].Value, 'base64').toString();
				this.configs[k.key] = JSON.parse(result);
			} catch (e) {
				if (k.required) {
					throw new Error(`Не найден ключ ${k.key}`)
				}
				Logger.warn(`Не найден ключ ${k.key}`);
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
