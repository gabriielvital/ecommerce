import { Controller, Post, Body, Get, Put, Delete, Param } from '@nestjs/common';
import { EnderecoService } from './endereco.service';
import { Endereco } from './endereco.entity';

@Controller('enderecos')
export class EnderecoController {
    constructor(private enderecoService: EnderecoService) {}

    @Post()
    async create(@Body() enderecoData: {rua: string; numero: string; bairro: string, complemento: string; usuarioId: number }): Promise<Endereco>{
        return this.enderecoService.create(enderecoData.rua, enderecoData.numero, enderecoData.bairro, enderecoData.complemento, enderecoData.usuarioId);
    }

    @Get()
    listar(){
        return this.enderecoService.listar()
    }

    @Get('usuario/:usuarioId')
    listarPorUsuario(@Param('usuarioId') usuarioId: number){
        return this.enderecoService.listarPorUsuario(usuarioId);
    }

    @Put(':id')
    atualizar(@Param('id') id: number, @Body() dados: Partial<Endereco>){
        return this.enderecoService.atualizar(id, dados);
    }

    @Delete(':id')
    remover(@Param('id') id: number){
        return this.enderecoService.remover(id);
    }
}