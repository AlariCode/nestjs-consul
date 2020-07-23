import { Test } from '@nestjs/testing';
import { ConsulModule, ConsulService } from '../../lib';
import { INestApplication } from '@nestjs/common';
import { ApiController } from '../mocks/api.controller';
import { ConfigInterface } from '../mocks/config.interface';

describe('Consule2e', () => {
	let api: INestApplication;
	let apiController: ApiController;
	let consulService: ConsulService<ConfigInterface>;

	beforeAll(async () => {
		const apiModule = await Test.createTestingModule({
			imports: [
				ConsulModule.forRoot<ConfigInterface>({
					keys: [{ key: 'am-cli/test' }],
					connection: {
						protocol: 'http',
						port: 8500,
						host: '192.168.0.252',
						token: 'admin',
					},
				}),
			],
			controllers: [ApiController],
		}).compile();
		api = apiModule.createNestApplication();
		await api.init();

		apiController = apiModule.get(ApiController);
		consulService = apiModule.get(ConsulService);
	});

	describe('testConfigs', () => {
		it('configs loaded', async () => {
			const config = await apiController.testConfig();
			expect(config['am-cli/test'].valuesString).toBe('test');
		});
	});
	describe('testMethods', () => {
		it('set', async () => {
			const res = await apiController.setConfig('test2');
			expect(res).toBe(true);
		});
		it('update', async () => {
			await consulService.update();
			const config = await apiController.testConfig();
			expect(config['am-cli/test'].valuesString).toBe('test2');
		});
		it('get', async () => {
			const config = await apiController.getConfig();
			await apiController.setConfig('test');
			expect(config.valuesString).toBe('test2');
		});
		it('delete', async () => {
			const res = await apiController.deleteConfig();
			await consulService.set<Test>('am-cli/test', { valueNum: 1, valuesString: 'test' });
			expect(res).toBe(true);
		});
	});

	afterAll(async () => {
		await api.close();
	});
});
