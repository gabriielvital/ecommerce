import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { PedidoProduto } from './pedido-produto.entity';
import { PedidoService } from './pedido.service';
import { Produto } from '../produto/produto.entity';
import { PedidoController} from './pedido.controller';
import { PedidoGateway } from './pedido.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Pedido, PedidoProduto, Produto])],
    controllers: [PedidoController],
    providers: [PedidoService, PedidoGateway],
    exports: [PedidoService],
})
export class PedidoModule {}