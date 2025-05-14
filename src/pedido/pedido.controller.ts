import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { Pedido } from './pedido.entity';

@Controller('pedidos')
export class PedidoController {
    constructor( private readonly pedidoService: PedidoService) {}

    @Get()
    listarPedido(){
        return this.pedidoService.listarPedido();
    }

    @Post()
    criarPedido(@Body() pedido: Pedido) {
        return this.pedidoService.criarPedido(pedido);
    }

    @Put(':id/status')
    atualizarStatus(@Param('id') id: number, @Body() status: string){
        return this.pedidoService.atualizarStatus(id, status);
    }

    @Delete(':id')
    excluirPedido(@Param('id') id: number){
        return this.pedidoService.excluirPedido(id);
    }
}