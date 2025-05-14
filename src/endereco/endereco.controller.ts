import { Controller, Post, Body } from '@nestjs/common';
import { EnderecoService } from './endereco.service';
import { Endereco } from './endereco.entity';

@Controller('enderecos')
export class EnderecoController {
    constructor(private enderecoService: EnderecoService) {}

    @Post()
    async create(@Body() enderecoData: {rua: string; numero: string; bairro: string, complemento: string; usuarioId: number }): Promise<Endereco>{
        return this.enderecoService.create(enderecoData.rua, enderecoData.numero, enderecoData.bairro, enderecoData.complemento, enderecoData.usuarioId);
    }
    
}