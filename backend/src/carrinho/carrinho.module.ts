import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrinho } from './carrinho.entity';
import { CarrinhoItem } from './carrinho_item.entity';
import { Produto } from '../produto/produto.entity';
import { CarrinhoService } from './carrinho.service';
import { CarrinhoController } from './carrinho.controller';
import { PedidoModule } from '../pedido/pedido.module';

@Module({
  imports: [TypeOrmModule.forFeature([Carrinho, CarrinhoItem, Produto]), PedidoModule],
  controllers: [CarrinhoController],
  providers: [CarrinhoService],
})
export class CarrinhoModule {}
