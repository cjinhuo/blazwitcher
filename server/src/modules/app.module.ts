import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { THROTTLE_LIMIT, THROTTLE_TTL } from 'src/shared/constants'
import { ArkController } from './ark.controller'
import { ArkService } from './ark.service'

@Module({
	imports: [
		ThrottlerModule.forRoot([
			{
				ttl: THROTTLE_TTL,
				limit: THROTTLE_LIMIT,
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
