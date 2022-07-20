import { HttpModule, HttpService } from '@nestjs/axios';
import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { ConsulService } from './consul.service';
import { IConsulConfig, IConsulAsyncConfig } from './interfaces/consul-config.interface';

@Global()
@Module({})
export class ConsulModule {
	static forRoot<T>(config: IConsulConfig<T>): DynamicModule {
		const consulServiceProvider: Provider = {
			provide: ConsulService,
			useFactory: async () => {
				const consulService = new ConsulService<T>(config, new HttpService());
				if (config.keys) {
					await consulService.update();
				}
				return consulService;
			},
		};
		return {
			module: ConsulModule,
			providers: [consulServiceProvider],
			exports: [consulServiceProvider],
			imports: [HttpModule]
		};
	}

	static forRootAsync<T>(options: IConsulAsyncConfig<T>): DynamicModule {
		const consulServiceProvider = this.createAsyncOptionsProvider<T>(options);
		return {
			module: ConsulModule,
			imports: options.imports,
			providers: [consulServiceProvider],
			exports: [consulServiceProvider]
		};
	}

	private static createAsyncOptionsProvider<T>(
		options: IConsulAsyncConfig<T>,
	): Provider {
		return {
			provide: ConsulService,
			useFactory: async (...args: any[]) => {
				const config = await options.useFactory(...args);
				const consulService = new ConsulService<T>(config, new HttpService());
				if (config.keys) {
					await consulService.update();
				}
				return consulService;
			},
			inject: options.inject || [],
		};
	}
}
