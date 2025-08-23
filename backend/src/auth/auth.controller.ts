import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Login com usuário e senha (retorna access_token)' })
    @ApiOkResponse({ description: 'Login realizado com sucesso. Retorna access_token.' })
    async login(@Request() req){
        return this.authService.login(req.user);
    }
}