import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedido.entity';
import { PedidoProduto } from './pedido-produto.entity';

@Injectable()
export class PedidoService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
    
        @InjectRepository(PedidoProduto)
        private pedidoProdutoRepository: Repository<PedidoProduto>,
    ) {}

    async criarPedido( pedido: Pedido): Promise<Pedido> {
        return this.pedidoRepository.save(pedido);
    }

    async listarPedido(): Promise<Pedido[]> {
        return this.pedidoRepository.find({relations: ['usuario', 'endereco', 'pedidoProdutos', 'pedidoProdutos.produto']});
    }

    async atualizarStatus(id: number, status: string): Promise<void>{
        await this.pedidoRepository.update(id, {status});
    }

    async excluirPedido(id: number): Promise<void>{
        await this.pedidoRepository.delete(id);
    }

}