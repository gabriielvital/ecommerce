import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('produtos')
@Controller('produtos')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) {}

    @Get()
    @ApiOkResponse({ description: 'Lista de produtos retornada com sucesso.' })
    listar() {
        return this.produtoService.listar();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiCreatedResponse({ description: 'Produto criado com sucesso.' })
    @Post()
    criar(@Body() produto: CreateProdutoDto) {
        return this.produtoService.criar(produto as unknown as Produto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Produto atualizado com sucesso.' })
    @Put(':id')
    atualizar(@Param('id') id: number, @Body() dados: Partial<Produto>){
        return this.produtoService.atualizar(id, dados);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiNoContentResponse({ description: 'Produto removido com sucesso.' })
    @Delete(':id')
    remover(@Param('id') id: number){
        return this.produtoService.deletar(id);
    }
}