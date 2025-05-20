import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedido.entity';
import { PedidoProduto } from './pedido-produto.entity';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { Usuario } from '../usuario/usuario.entity';
import { Endereco } from '../endereco/endereco.entity';
import { Produto } from '../produto/produto.entity';

@Injectable()
export class PedidoService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
    
        @InjectRepository(PedidoProduto)
        private pedidoProdutoRepository: Repository<PedidoProduto>,
    ) {}

    async criarPedido(dados: CriarPedidoDto): Promise<Pedido> {
        const pedido = new Pedido();
        pedido.usuario = { id: dados.usuarioId } as Usuario;
        pedido.endereco = { id: dados.enderecoId } as Endereco;
      
        pedido.pedidoProdutos = dados.produtos.map(p => {
          const pp = new PedidoProduto();
          pp.produto = { id: p.produtoId } as Produto;
          pp.quantidade = p.quantidade;
          return pp;
        });
      
        pedido.status = 'pendente';
      
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