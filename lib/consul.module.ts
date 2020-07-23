import { Module, DynamicModule, Provider, Global, HttpService } from '@nestjs/common';
import { ConsulService } from './consul.service';
import { IConsulConfig } from './interfaces/consul-config.interface';

@Global()
@Module({})
export class ConsulModule {
	static forRoot<T>(config: IConsulConfig): DynamicModule {
		const consulServiceProvider: Provider = {
			provide: ConsulService,
			useFactory: async () => {
				const consulService = new ConsulService<T>(config, new HttpService());
				if(config.keys) {
					await consulService.update();
				}
				return consulService;
			},
		};
		return {
			module: ConsulModule,
			providers: [consulServiceProvider],
			exports: [consulServiceProvider],
		};
	}
}
