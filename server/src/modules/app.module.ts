import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { ArkController } from './ark.controller'
import { ArkService } from './ark.service'

@Module({
	imports: [
		ThrottlerModule.forRoot([
			{
				ttl: 60 * 60 * 1000, // 1小时时间窗口
				limit: 1, // 每小时最多20次请求
			},
		]),
	],
	controllers: [ArkController],
	providers: [ArkService],
})
export class AppModule {}
