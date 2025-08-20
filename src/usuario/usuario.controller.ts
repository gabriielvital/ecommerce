import { Controller, Post, Get, Body, Param, Headers, ForbiddenException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';
import { Role } from '../auth/role.enum';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuarioController {
    constructor(private usuarioService: UsuarioService) {}

    @Post()
    @ApiCreatedResponse({ description: 'Usuário criado com sucesso.' })
    async create(@Body() usuarioData: {username: string; email: string; password: string; role?: Role}): Promise<Usuario> {
        return this.usuarioService.create(usuarioData.username, usuarioData.email, usuarioData.password);
    }

    @Get('email/:email')
    @ApiOkResponse({ description: 'Usuário encontrado por email.' })
    async findByEmail(@Param('email') email: string): Promise<Usuario | null> {
        return this.usuarioService.findByEmail(email);
    }

    @Post(':id/promote')
    @ApiOkResponse({ description: 'Usuário promovido a ADMIN com sucesso (endpoint de setup).' })
    async promote(@Param('id') id: number, @Headers('x-setup-token') setupToken?: string): Promise<Usuario> {
        if (setupToken !== 'setup-secret') {
            throw new ForbiddenException('Token inválido');
        }
        return this.usuarioService.promoteToAdmin(+id);
    }
}