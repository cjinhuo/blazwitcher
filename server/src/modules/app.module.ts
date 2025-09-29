import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { ArkController } from './ark.controller'
import { ArkService } from './ark.service'

@Module({
	imports: [
		ThrottlerModule.forRoot([
			{
				ttl: 60 * 60 * 1000, // 1小时
				limit: 10, // 每小时10次请求
			},
		]),
	],
	controllers: [ArkController],
	providers: [
		ArkService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
