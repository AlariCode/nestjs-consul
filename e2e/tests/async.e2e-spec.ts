import { Test } from '@nestjs/testing';
import { ConsulModule, ConsulService } from '../../lib';
import { INestApplication } from '@nestjs/common';
import { ApiController } from '../mocks/api.controller';
import { ConfigInterface } from '../mocks/config.interface';
import { TestModule } from '../mocks/test.module';
import { TestService } from '../mocks/test.service';

describe('ConsulE2eAsync', () => {
	let api: INestApplication;
	let apiController: ApiController;
	let consulService: ConsulService<ConfigInterface>;

	beforeAll(async () => {
		const apiModule = await Test.createTestingModule({
			imports: [
				TestModule,
				ConsulModule.forRootAsync({
					imports: [TestModule],
					inject: [TestService],
					useFactory: async (testService: TestService) => {
						return {
							keys: [{ key: 'am-cli/test' }],
							connection: {
								protocol: 'http',
								port: testService.getIP(),
								host: '192.168.0.252',
								token: 'admin',
							},
						};
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

	describe('testConnection', () => {
		it('set', async () => {
			const res = await apiController.setConfig('test2');
			expect(res).toBe(true);
		});
	});
});
