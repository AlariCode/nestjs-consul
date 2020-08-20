import { Module } from '@nestjs/common';
import { TestService } from './test.service';

@Module({
	providers: [TestService],
	exports: [TestService]
})
export class TestModule {}
