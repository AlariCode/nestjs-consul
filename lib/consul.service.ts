import { IConsulConfig, IConsulKeys } from './interfaces/consul-config.interface';
import { Logger } from '@nestjs/common';
import { IConsulResponse } from './interfaces/consul-response.interface';
import { schedule } from 'node-cron';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, of } from 'rxjs';

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

	private async getKeyFromConsul(k: IConsulKeys): Promise<IConsulResponse[] | null> {
		const observable = this.httpService
			.get<IConsulResponse[]>(`${this.consulURL}${String(k.key)}`, {
				headers: {
					'X-Consul-Token': this.token,
				},
			})
			.pipe(
				map((response) => response.data),
				catchError(() => {
					const msg = `Cannot find key ${String(k.key)}`;
					if (k.required) {
						throw new Error(msg);
					}
					Logger.warn(msg);
					return of(null);
				})
			);
		return await lastValueFrom(observable);
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
		if (!this.keys) {
			return;
		}
		for (const k of this.keys) {
			const data = await this.getKeyFromConsul(k);
			if (data) {
				this.updateConfig(data[0].Value, k);
			}
		}
	}

	public async set<T>(key: string, value: T): Promise<boolean> {
		const observable = this.httpService
			.put<boolean>(`${this.consulURL}${key}`, value, {
				headers: {
					'X-Consul-Token': this.token,
				},
			})
			.pipe(
				map((response) => response.data),
				catchError((e) => {
					Logger.error(e);
					return of(false);
				})
			);
		return await lastValueFrom(observable);
	}

	public async get<T>(key: string): Promise<T> {
		const observable = this.httpService
			.get<boolean>(`${this.consulURL}${key}`, {
				headers: {
					'X-Consul-Token': this.token,
				},
			})
			.pipe(
				map(({ data }) => Buffer.from(data[0].Value, 'base64').toString()),
				map((result) => JSON.parse(result) as T),
				catchError(() => {
					return of({} as T);
				})
			);

		return await lastValueFrom(observable);
	}

	public async delete(key: string): Promise<boolean> {
		const observable = this.httpService
			.delete<boolean>(`${this.consulURL}${key}`, {
				headers: {
					'X-Consul-Token': this.token,
				},
			})
			.pipe(
				map((response) => response.data),
				catchError((e) => {
					Logger.error(e);
					return of(false);
				})
			);
		return await lastValueFrom(observable);
	}

	private planUpdate(updateCron: string | undefined) {
		if (updateCron) {
			schedule(updateCron, async () => {
				this.update();
			});
		}
	}
}
