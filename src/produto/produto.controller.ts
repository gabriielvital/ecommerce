import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { Produto } from './produto.entity';

@Controller('produtos')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) {}

    @Get()
    findAll() {
        return this.produtoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number){
        return this.produtoService.findOne(id);
    }

    @Post()
    create(@Body() produto: Produto) {
        return this.produtoService.delete(id);
    }

    @Delete(':id')
    this.delete(@Param('id') id: number) {
        return this.produtoService.delete(id);
    }
}