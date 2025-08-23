import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags, ApiOperation, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('produtos')
@Controller('produtos')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) {}

    @Get()
    @ApiOperation({ summary: 'Listar produtos (público)' })
    @ApiOkResponse({ description: 'Lista de produtos retornada com sucesso.' })
    listar() {
        return this.produtoService.listar();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Criar produto (ADMIN)' })
    @ApiCreatedResponse({ description: 'Produto criado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Apenas ADMIN pode criar produtos.' })
    @Post()
    criar(@Body() produto: CreateProdutoDto) {
        return this.produtoService.criar(produto as unknown as Produto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar produto (ADMIN)' })
    @ApiOkResponse({ description: 'Produto atualizado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Apenas ADMIN pode atualizar produtos.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do produto' })
    @Put(':id')
    atualizar(@Param('id') id: number, @Body() dados: Partial<Produto>){
        return this.produtoService.atualizar(id, dados);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remover produto (ADMIN)' })
    @ApiNoContentResponse({ description: 'Produto removido com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Apenas ADMIN pode remover produtos.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do produto' })
    @Delete(':id')
    remover(@Param('id') id: number){
        return this.produtoService.deletar(id);
    }
}