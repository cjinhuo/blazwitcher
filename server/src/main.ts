import { NestFactory } from '@nestjs/core'
// 加载环境变量
import * as dotenv from 'dotenv'
import { AppModule } from './app.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const port = process.env.PORT || 3000
	await app.listen(port)
	console.log(`Application is running on: http://localhost:${port}`)
}
bootstrap()
