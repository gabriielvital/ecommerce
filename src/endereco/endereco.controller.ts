import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { EnderecoService } from './endereco.service';
import { Endereco } from './endereco.entity';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('enderecos')
@Controller('enderecos')
export class EnderecoController {
    constructor(private enderecoService: EnderecoService) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiCreatedResponse({ description: 'Endereço criado com sucesso.' })
    @Post()
    async create(@Body() enderecoData: CreateEnderecoDto, @Req() req: any): Promise<Endereco>{
        const userId = enderecoData.usuarioId ?? req.user?.id;
        if (!userId) throw new BadRequestException('Usuário não identificado');
        return this.enderecoService.create(
            enderecoData.rua,
            enderecoData.numero,
            enderecoData.bairro,
            enderecoData.complemento ?? '',
            userId,
        );
    }

    @Get()
    @ApiOkResponse({ description: 'Lista de endereços retornada com sucesso.' })
    listar(){
        return this.enderecoService.listar()
    }

    @Get('usuario/:usuarioId')
    @ApiOkResponse({ description: 'Lista de endereços do usuário retornada com sucesso.' })
    listarPorUsuario(@Param('usuarioId') usuarioId: number){
        return this.enderecoService.listarPorUsuario(usuarioId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Endereço atualizado com sucesso.' })
    @Put(':id')
    atualizar(@Param('id') id: number, @Body() dados: Partial<Endereco>){
        return this.enderecoService.atualizar(id, dados);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Endereço removido com sucesso.' })
    @Delete(':id')
    remover(@Param('id') id: number){
        return this.enderecoService.remover(id);
    }
}