import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { EnderecoService } from './endereco.service';
import { Endereco } from './endereco.entity';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiOperation, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';
import { User, AuthUser } from '../common/decorators/user.decorator';

@ApiTags('enderecos')
@Controller('enderecos')
export class EnderecoController {
    constructor(private enderecoService: EnderecoService) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Criar endereço (usuário autenticado)' })
    @ApiCreatedResponse({ description: 'Endereço criado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @Post()
    async create(@Body() enderecoData: CreateEnderecoDto, @User() user: AuthUser): Promise<Endereco>{
        const userId = enderecoData.usuarioId ?? user?.id;
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
    @ApiOperation({ summary: 'Listar endereços (público)' })
    @ApiOkResponse({ description: 'Lista de endereços retornada com sucesso.' })
    listar(){
        return this.enderecoService.listar()
    }

    @Get('usuario/:usuarioId')
    @ApiOperation({ summary: 'Listar endereços por usuário (público)' })
    @ApiOkResponse({ description: 'Lista de endereços do usuário retornada com sucesso.' })
    @ApiParam({ name: 'usuarioId', type: Number, example: 1, description: 'ID do usuário' })
    listarPorUsuario(@Param('usuarioId') usuarioId: number){
        return this.enderecoService.listarPorUsuario(usuarioId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar endereço (usuário autenticado)' })
    @ApiOkResponse({ description: 'Endereço atualizado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do endereço' })
    @Put(':id')
    atualizar(@Param('id') id: number, @Body() dados: Partial<Endereco>){
        return this.enderecoService.atualizar(id, dados);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remover endereço (usuário autenticado)' })
    @ApiOkResponse({ description: 'Endereço removido com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do endereço' })
    @Delete(':id')
    remover(@Param('id') id: number){
        return this.enderecoService.remover(id);
    }
}