import { Controller, Post, Get, Body, Param, Headers, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';
import { Role } from '../auth/role.enum';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiOperation, ApiParam, ApiHeader } from '@nestjs/swagger';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuarioController {
    constructor(private usuarioService: UsuarioService) {}

    @Post()
    @ApiOperation({ summary: 'Criar usuário (público)' })
    @ApiCreatedResponse({ description: 'Usuário criado com sucesso.' })
    async create(@Body() usuarioData: CreateUsuarioDto): Promise<Usuario> {
        return this.usuarioService.create(usuarioData.username, usuarioData.email, usuarioData.password);
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Buscar usuário por email (público)' })
    @ApiOkResponse({ description: 'Usuário encontrado por email.' })
    @ApiParam({ name: 'email', type: String, example: 'john@example.com', description: 'E-mail do usuário' })
    async findByEmail(@Param('email') email: string): Promise<Usuario> {
        const user = await this.usuarioService.findByEmail(email);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        return user;
    }

    @Get()
    @ApiOperation({ summary: 'Listar usuários (apenas setup via header)' })
    @ApiOkResponse({ description: 'Lista de usuários retornada (endpoint de setup).' })
    @ApiHeader({ name: 'x-setup-token', required: true, description: 'Token de setup para permitir a listagem' })
    async listAll(@Headers('x-setup-token') setupToken?: string): Promise<Usuario[]> {
        if (setupToken !== 'setup-secret') {
            throw new ForbiddenException('Token inválido');
        }
        // Exibe todos para facilitar encontrar o id em ambiente de setup/dev
        // Atenção: não exponha esse endpoint em produção.
        return (await this.usuarioService['usuarioRepository'].find());
    }

    @Post(':id/promote')
    @ApiOperation({ summary: 'Promover usuário a ADMIN (apenas setup via header)' })
    @ApiOkResponse({ description: 'Usuário promovido a ADMIN com sucesso (endpoint de setup).' })
    @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID do usuário' })
    @ApiHeader({ name: 'x-setup-token', required: true, description: 'Token de setup para permitir a promoção' })
    async promote(@Param('id') id: number, @Headers('x-setup-token') setupToken?: string): Promise<Usuario> {
        if (setupToken !== 'setup-secret') {
            throw new ForbiddenException('Token inválido');
        }
        return this.usuarioService.promoteToAdmin(+id);
    }
}