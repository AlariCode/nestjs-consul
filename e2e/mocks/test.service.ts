import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
	getIP() {
		return 8500;
	}
}
