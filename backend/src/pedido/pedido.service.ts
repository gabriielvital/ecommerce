import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FormaPagamento, Pedido, PedidoStatus } from './pedido.entity';
import { PedidoProduto } from './pedido-produto.entity';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { Usuario } from '../usuario/usuario.entity';
import { Endereco } from '../endereco/endereco.entity';
import { Produto } from '../produto/produto.entity';
import { AtualizarPedidoDto } from './dto/atualizar-pedido.dto';
import { PedidoGateway } from './pedido.gateway';
import { CheckoutGuestDto } from './dto/checkout-guest.dto';

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
        return await this.pedidoRepository.manager.transaction(async (trx) => {
          const pedidoRepo = trx.getRepository(Pedido);
          const pedidoProdutoRepo = trx.getRepository(PedidoProduto);
          const produtoRepo = trx.getRepository(Produto);

          const pedido = new Pedido();
          pedido.usuario = { id: dados.usuarioId } as Usuario;
          pedido.endereco = { id: dados.enderecoId } as Endereco;

          const produtoIds = dados.produtos.map((p) => p.produtoId);
          const produtos = await produtoRepo.find({ where: { id: In(produtoIds) } });
          if (produtos.length !== produtoIds.length) {
            throw new NotFoundException('Um ou mais produtos não foram encontrados');
          }

          let total = 0;
          pedido.pedidoProdutos = dados.produtos.map((p) => {
            const produto = produtos.find((pr) => pr.id === p.produtoId)!;
            const pp = new PedidoProduto();
            pp.produto = { id: p.produtoId } as Produto;
            pp.quantidade = p.quantidade;
            pp.pedido = pedido;
            total += Number(produto.preco) * p.quantidade;
            return pp;
          });

          pedido.total = Number(total.toFixed(2));
          pedido.status = PedidoStatus.PENDENTE;

          const created = await pedidoRepo.save(pedido);
          const withRelations = await pedidoRepo.findOne({
            where: { id: created.id },
            relations: ['usuario', 'endereco', 'pedidoProdutos', 'pedidoProdutos.produto'],
          });
          if (withRelations) {
            this.pedidoGateway.emitPedidoCriado(withRelations);
            return withRelations;
          }
          return created;
        });
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
        return await this.pedidoRepository.manager.transaction(async (trx) => {
          const pedidoRepo = trx.getRepository(Pedido);
          const pedidoProdutoRepo = trx.getRepository(PedidoProduto);
          const produtoRepo = trx.getRepository(Produto);

          const pedido = await pedidoRepo.findOne({ where: { id }, relations: ['pedidoProdutos'] });
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
            await pedidoProdutoRepo.delete({ pedido: { id } as any });

            const produtoIds = dados.produtos.map((p) => p.produtoId);
            const produtos = await produtoRepo.find({ where: { id: In(produtoIds) } });
            if (produtos.length !== produtoIds.length) {
              throw new NotFoundException('Um ou mais produtos não foram encontrados');
            }

            let total = 0;
            pedido.pedidoProdutos = dados.produtos.map((p) => {
              const produto = produtos.find((pr) => pr.id === p.produtoId)!;
              const pp = new PedidoProduto();
              pp.produto = { id: p.produtoId } as Produto;
              pp.quantidade = p.quantidade;
              pp.pedido = pedido;
              total += Number(produto.preco) * p.quantidade;
              return pp;
            });
            pedido.total = Number(total.toFixed(2));
          }

          const saved = await pedidoRepo.save(pedido);
          const withRelations = await pedidoRepo.findOne({ where: { id: saved.id }, relations: ['usuario'] });
          if (withRelations) {
            this.pedidoGateway.emitStatusAtualizado(withRelations);
          }
          return saved;
        });
      }

    async excluirPedido(id: number): Promise<void>{
        await this.pedidoRepository.delete(id);
    }

    async criarPedidoConvidado(dados: CheckoutGuestDto): Promise<Pedido> {
      return await this.pedidoRepository.manager.transaction(async (trx) => {
        const pedidoRepo = trx.getRepository(Pedido);
        const produtoRepo = trx.getRepository(Produto);
        const pedidoProdutoRepo = trx.getRepository(PedidoProduto);

        if (!dados.itens || dados.itens.length === 0) {
          throw new BadRequestException('Carrinho vazio');
        }

        const produtoIds = dados.itens.map(i => i.produtoId)
        const produtos = await produtoRepo.find({ where: { id: In(produtoIds) } });
        if (produtos.length !== produtoIds.length) {
          throw new NotFoundException('Um ou mais produtos não foram encontrados');
        }

        const pedido = new Pedido()
        pedido.usuario = null
        pedido.endereco = null
        pedido.rua = dados.rua
        pedido.numero = dados.numero
        pedido.bairro = dados.bairro
        pedido.complemento = dados.complemento
        pedido.nomeCliente = dados.nomeCliente
        pedido.telefone = dados.telefone
        pedido.formaPagamento = dados.formaPagamento as FormaPagamento
        pedido.trocoPara = dados.trocoPara ?? null
        pedido.status = PedidoStatus.PENDENTE

        let total = 0
        pedido.pedidoProdutos = dados.itens.map((it) => {
          const pr = produtos.find(p => p.id === it.produtoId)!
          total += Number(pr.preco) * it.quantidade
          const pp = new PedidoProduto()
          pp.produto = { id: it.produtoId } as any
          pp.quantidade = it.quantidade
          pp.pedido = pedido
          return pp
        })
        pedido.total = Number(total.toFixed(2))

        const created = await pedidoRepo.save(pedido)
        const withRelations = await pedidoRepo.findOne({ where: { id: created.id }, relations: ['pedidoProdutos', 'pedidoProdutos.produto'] })
        if (withRelations) {
          this.pedidoGateway.emitPedidoCriado(withRelations)
          return withRelations
        }
        return created
      })
    }

}