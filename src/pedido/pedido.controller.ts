import { Controller, Get, Post, Body } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { Pedido } from './pedido.entity';

@Controller('pedidos')
export class PedidoController {
    constructor( private readonly pedidoService: PedidoService) {}

    @Get()
    findAll(){
        return this.pedidoService.findAll();
    }

    @Post()
    create(@Body() pedido: Pedido) {
        return this.pedidoService.create(pedido);
    }
}