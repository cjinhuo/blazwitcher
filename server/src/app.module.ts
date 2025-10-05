import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { ArkController } from './modules/ark/ark.controller'
import { ArkService } from './modules/ark/ark.service'
import { RootController } from './modules/root/root.controller'
import { THROTTLE_LIMIT, THROTTLE_TTL } from './shared/constants'

@Module({
	imports: [
		ThrottlerModule.forRoot([
			{
				ttl: THROTTLE_TTL,
				limit: THROTTLE_LIMIT,
			},
		]),
	],
	controllers: [ArkController, RootController],
	providers: [
		ArkService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
