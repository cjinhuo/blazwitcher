import { Module } from '@nestjs/common'
import { ArkController } from './ark.controller'
import { ArkService } from './ark.service'

@Module({
	controllers: [ArkController],
	providers: [ArkService],
})
export class AppModule {}
