import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pedido, PedidoStatus } from './pedido.entity';
import { PedidoProduto } from './pedido-produto.entity';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { Usuario } from '../usuario/usuario.entity';
import { Endereco } from '../endereco/endereco.entity';
import { Produto } from '../produto/produto.entity';
import { AtualizarPedidoDto } from './dto/atualizar-pedido.dto';
import { PedidoGateway } from './pedido.gateway';

@Injectable()
export class PedidoService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
    
        @InjectRepository(PedidoProduto)
        private pedidoProdutoRepository: Repository<PedidoProduto>,
        @InjectRepository(Produto)
        private produtoRepository: Repository<Produto>,
        private pedidoGateway: PedidoGateway,
    ) {}

    private isValidStatusTransition(from: PedidoStatus, to: PedidoStatus): boolean {
        // Fluxo principal: PENDENTE -> PREPARANDO -> SAIU_PARA_ENTREGA -> ENTREGUE
        // CANCELADO permitido apenas a partir de PENDENTE ou PREPARANDO
        const allowed: Record<PedidoStatus, PedidoStatus[]> = {
            [PedidoStatus.PENDENTE]: [PedidoStatus.PREPARANDO, PedidoStatus.CANCELADO],
            [PedidoStatus.PREPARANDO]: [PedidoStatus.SAIU_PARA_ENTREGA, PedidoStatus.CANCELADO],
            [PedidoStatus.SAIU_PARA_ENTREGA]: [PedidoStatus.ENTREGUE],
            [PedidoStatus.ENTREGUE]: [],
            [PedidoStatus.CANCELADO]: [],
        };
        return allowed[from]?.includes(to) ?? false;
    }

    async criarPedido(dados: CriarPedidoDto): Promise<Pedido> {
        const pedido = new Pedido();
        pedido.usuario = { id: dados.usuarioId } as Usuario;
        pedido.endereco = { id: dados.enderecoId } as Endereco;
      
        const produtoIds = dados.produtos.map(p => p.produtoId);
        const produtos = await this.produtoRepository.find({ where: { id: In(produtoIds) } });
        if (produtos.length !== produtoIds.length) {
          throw new NotFoundException('Um ou mais produtos não foram encontrados');
        }

        let total = 0;
        pedido.pedidoProdutos = dados.produtos.map(p => {
          const produto = produtos.find(pr => pr.id === p.produtoId)!;
          const pp = new PedidoProduto();
          pp.produto = { id: p.produtoId } as Produto;
          pp.quantidade = p.quantidade;
          total += Number(produto.preco) * p.quantidade;
          return pp;
        });

        pedido.total = Number(total.toFixed(2));
        pedido.status = PedidoStatus.PENDENTE;

        const created = await this.pedidoRepository.save(pedido);
        const withRelations = await this.pedidoRepository.findOne({ where: { id: created.id }, relations: ['usuario', 'endereco', 'pedidoProdutos', 'pedidoProdutos.produto'] });
        if (withRelations) {
            this.pedidoGateway.emitPedidoCriado(withRelations);
        }
        return created;
      }

    async listarPedido(): Promise<Pedido[]> {
        return this.pedidoRepository.find({relations: ['usuario', 'endereco', 'pedidoProdutos', 'pedidoProdutos.produto']});
    }

    async buscarPorId(id: number): Promise<Pedido | null> {
        return this.pedidoRepository.findOne({ where: { id }, relations: ['usuario', 'endereco', 'pedidoProdutos', 'pedidoProdutos.produto'] });
    }

    async listarPorUsuario(usuarioId: number): Promise<Pedido[]> {
        return this.pedidoRepository.find({ where: { usuario: { id: usuarioId } }, relations: ['usuario', 'endereco', 'pedidoProdutos', 'pedidoProdutos.produto'] });
    }

    async atualizarPedido(id: number, dados: AtualizarPedidoDto): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
          where: { id },
          relations: ['pedidoProdutos'],
        });
      
        if (!pedido) {
          throw new NotFoundException('Pedido não encontrado');
        }
      
        if (dados.usuarioId) {
          pedido.usuario = { id: dados.usuarioId } as Usuario;
        }
      
        if (dados.enderecoId) {
          pedido.endereco = { id: dados.enderecoId } as Endereco;
        }
      
        if (dados.status) {
          if (!this.isValidStatusTransition(pedido.status, dados.status)) {
            throw new BadRequestException(`Transição de status inválida: ${pedido.status} -> ${dados.status}`);
          }
          pedido.status = dados.status;
        }
      
        if (dados.produtos && dados.produtos.length > 0) {
          await this.pedidoProdutoRepository.delete({ pedido: { id } });

          const produtoIds = dados.produtos.map(p => p.produtoId);
          const produtos = await this.produtoRepository.find({ where: { id: In(produtoIds) } });
          if (produtos.length !== produtoIds.length) {
            throw new NotFoundException('Um ou mais produtos não foram encontrados');
          }

          let total = 0;
          pedido.pedidoProdutos = dados.produtos.map(p => {
            const produto = produtos.find(pr => pr.id === p.produtoId)!;
            const pp = new PedidoProduto();
            pp.produto = { id: p.produtoId } as Produto;
            pp.quantidade = p.quantidade;
            total += Number(produto.preco) * p.quantidade;
            return pp;
          });
          pedido.total = Number(total.toFixed(2));
        }
      
        const saved = await this.pedidoRepository.save(pedido);
        const withRelations = await this.pedidoRepository.findOne({ where: { id: saved.id }, relations: ['usuario'] });
        if (withRelations) {
            this.pedidoGateway.emitStatusAtualizado(withRelations);
        }
        return saved;
      }

    async excluirPedido(id: number): Promise<void>{
        await this.pedidoRepository.delete(id);
    }

}