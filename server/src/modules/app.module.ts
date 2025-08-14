import { Module } from '@nestjs/common'
import { ArkController } from './ark.controller'
import { ArkService } from './ark.service'

@Module({
	imports: [],
	controllers: [ArkController],
	providers: [ArkService],
})
export class AppModule {}
