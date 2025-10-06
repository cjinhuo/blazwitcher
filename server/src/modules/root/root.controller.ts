import { Controller, Get } from '@nestjs/common'

@Controller()
export class RootController {
	@Get()
	getHello(): string {
		return 'hello blazwitcher'
	}
}
