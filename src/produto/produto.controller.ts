import { Controller, Get, Put, Post, Delete, Body, Param } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { Produto } from './produto.entity';

@Controller('produtos')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) {}

    @Get()
    listar() {
        return this.produtoService.listar();
    }

    @Post()
    criar(@Body() produto: Produto) {
        return this.produtoService.criar(produto);
    }

    @Put(':id')
    atualizar(@Param('id') id: number, @Body() dados: Partial<Produto>){
        return this.produtoService.atualizar(id, dados);
    }

    @Delete(':id')
    remover(@Param('id') id: number){
        return this.produtoService.deletar(id);
    }
}