import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware'
import { ArkController } from './ark.controller'
import { ArkService } from './ark.service'

@Module({
	imports: [],
	controllers: [ArkController],
	providers: [ArkService, RateLimitMiddleware],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RateLimitMiddleware).forRoutes('ark/*') // 只对 ark 路由应用限流
	}
}
