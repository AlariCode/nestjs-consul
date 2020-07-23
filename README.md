# NestJS consul config Module

![alt cover](https://github.com/AlariCode/nestjs-consul/raw/master/img/logo.jpg)

**More NestJS libs on [alariblog.ru](https://alariblog.ru)**

[![npm version](https://badgen.net/npm/v/nestjs-consul)](https://www.npmjs.com/package/nestjs-dotenv)
[![npm version](https://badgen.net/npm/license/nestjs-consul)](https://www.npmjs.com/package/nestjs-dotenv)
[![npm version](https://badgen.net/github/open-issues/AlariCode/nestjs-consul)](https://github.com/AlariCode/nestjs-dotenv/issues)
[![npm version](https://badgen.net/github/prs/AlariCode/nestjs-consul)](https://github.com/AlariCode/nestjs-dotenv/pulls)

NestJS consul package allows you to load configs from consul and work with key/values.

```bash
npm i nestjs-consul
```

Then register module in your root app.module

```javascript
import { ConsulModule } from 'nestjs-consul';

@Module({
	imports: [
		// ...
		ConsulModule.forRoot<YourConfig>({
            keys: [{ key: 'your/keypath' }],
            updateCron: '* * * * *',
            connection: {
                protocol: 'http',
                port: 8500,
                host: '192.168.0.1',
                token: 'mutoken',
            },
        }),
	],
})
export class AppModule {}
```
- **keys** (IConsulKeys[]?) - array of keys and required status from which you want to load values. If key was not found and it was required, app with throw an exception. If it was not required - you will see warning. If no keys specified, no initial configs will be loaded.  
- **updateCron** (string) - cron string. If specified, will update configs on cron.
- **protocol** ('http' | 'https') - consul protocol.
- **protocol** ('http' | 'https') - consul protocol.
- **port** (number) - consul port.
- **host** (string) - consul host.
- **token** (string) - consul auth token.
- **YourConfig** (interface) - interface, that describes you entire config. This will allow you to use type save configs. In this example it would be like:

```javascript
export interface YourConfig {
    'your/keypath': {
        value1: number;
        value2: string;
    }
}
```

Then you can use your configs with public property `configs` of `ConsuleService`.

```javascript
import { ConsuleService } from 'nestjs-consul';

constructor(
	private readonly consul: ConsuleService
) {}

myMethod() {
    const configs = this.consul.configs;
}

```

## Additional methods

### update()
Returns `Promise<void>`. Force updates your config.

```javascript
await this.consul.update();
```

### get<T>(key: string)
Returns `Promise<T>`. Gets a value from consul with `key` and `T` type.

```javascript
const value = await this.consul.get<MyInterface>('my/key');
```

### set<T>(key: string, value: T)
Returns `Promise<boolean>`. Sets a value to consul with `key` and `T` type. Returns `true` if succeeded.

```javascript
const response = await this.consul.set<MyInterface>('my/key', value);
```

### delete(key: string)
Returns `Promise<boolean>`. Deletes a value from consul with `key`. Returns `true` if succeeded.

```javascript
const response = await this.consul.delete('my/key');
```

## Running tests
To run e2e tests you need to have consul instance started and run test for the firs time (to add config key).

Then run tests with.
```
npm run test
```
![alt cover](https://github.com/AlariCode/nestjs-consul/raw/master/img/tests.png)
