import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrinho } from './carrinho.entity';
import { CarrinhoItem } from './carrinho_item.entity';
import { Produto } from '../produto/produto.entity';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PedidoService } from '../pedido/pedido.service';

@Injectable()
export class CarrinhoService {
  constructor(
    @InjectRepository(Carrinho)
    private readonly carrinhoRepo: Repository<Carrinho>,
    @InjectRepository(CarrinhoItem)
    private readonly itemRepo: Repository<CarrinhoItem>,
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
    private readonly pedidoService: PedidoService,
  ) {}

  private async getOrCreateCarrinho(userId: number): Promise<Carrinho> {
    let carrinho = await this.carrinhoRepo.findOne({ where: { usuario: { id: userId } }, relations: ['itens', 'itens.produto', 'usuario'] });
    if (!carrinho) {
      carrinho = this.carrinhoRepo.create({ usuario: { id: userId } as any, itens: [] });
      carrinho = await this.carrinhoRepo.save(carrinho);
    }
    return carrinho;
  }

  async obterCarrinho(userId: number): Promise<Carrinho> {
    return this.getOrCreateCarrinho(userId);
  }

  async adicionarItem(userId: number, dto: AddItemDto): Promise<Carrinho> {
    const carrinho = await this.getOrCreateCarrinho(userId);
    const produto = await this.produtoRepo.findOne({ where: { id: dto.produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    const existente = carrinho.itens?.find((i) => i.produto.id === dto.produtoId);
    if (existente) {
      existente.quantidade += dto.quantidade;
      await this.itemRepo.save(existente);
    } else {
      const item = this.itemRepo.create({ carrinho: { id: carrinho.id } as any, produto: { id: dto.produtoId } as any, quantidade: dto.quantidade });
      await this.itemRepo.save(item);
    }
    return this.obterCarrinho(userId);
  }

  async atualizarItem(userId: number, itemId: number, dto: UpdateItemDto): Promise<Carrinho> {
    const item = await this.itemRepo.findOne({ where: { id: itemId }, relations: ['carrinho', 'produto', 'carrinho.usuario'] });
    if (!item || item.carrinho.usuario.id !== userId) throw new NotFoundException('Item não encontrado');
    if (dto.quantidade !== undefined) {
      if (dto.quantidade <= 0) throw new BadRequestException('Quantidade inválida');
      item.quantidade = dto.quantidade;
    }
    await this.itemRepo.save(item);
    return this.obterCarrinho(userId);
  }

  async removerItem(userId: number, itemId: number): Promise<Carrinho> {
    const item = await this.itemRepo.findOne({ where: { id: itemId }, relations: ['carrinho', 'carrinho.usuario'] });
    if (!item || item.carrinho.usuario.id !== userId) throw new NotFoundException('Item não encontrado');
    await this.itemRepo.delete(itemId);
    return this.obterCarrinho(userId);
  }

  async limpar(userId: number): Promise<void> {
    const carrinho = await this.getOrCreateCarrinho(userId);
    if (carrinho.itens?.length) {
      await this.itemRepo.delete({ carrinho: { id: carrinho.id } as any });
    }
  }

  async checkout(userId: number, enderecoId: number) {
    const carrinho = await this.getOrCreateCarrinho(userId);
    if (!carrinho.itens || carrinho.itens.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }
    const produtos = carrinho.itens.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade }));
    const pedido = await this.pedidoService.criarPedido({ usuarioId: userId, enderecoId, produtos });
    await this.limpar(userId);
    return pedido;
  }
}
