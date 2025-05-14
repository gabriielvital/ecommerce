import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';

@Controller('usuarios')
export class UsuarioController {
    constructor(private usuarioService: UsuarioService) {}

    @Post()
    async create(@Body() usuarioData: {username: string; email: string; password: string}): Promise<Usuario> {
        return this.usuarioService.create(usuarioData.username, usuarioData.email, usuarioData.password);
    }

    @Get('email')
    async findByEmail(@Param('email') email: string): Promise<Usuario | null> {
        return this.usuarioService.findByEmail(email);
    }
}