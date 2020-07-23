import { Controller } from '@nestjs/common';
import { ConsulService } from '../../lib';
import { ConfigInterface, ITest } from './config.interface';

@Controller()
export class ApiController {
	constructor(private readonly consul: ConsulService<ConfigInterface>) {
	}

	async testConfig() {
		return this.consul.configs;
	}

	async setConfig(value: string) {
		return this.consul.set<ITest>('am-cli/test', {
			valueNum: 1,
			valuesString: value
		});
	}

	async getConfig() {
		return this.consul.get<ITest>('am-cli/test');
	}

	async deleteConfig() {
		return this.consul.delete('am-cli/test');
	}
}
