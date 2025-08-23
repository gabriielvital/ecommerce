import { Test, TestingModule } from '@nestjs/testing';
import { PedidoService } from './pedido.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { PedidoProduto } from './pedido-produto.entity';
import { Repository } from 'typeorm';
import { CriarPedidoDto } from './dto/criar-pedido.dto';

describe('PedidoService', () => {
  let service: PedidoService;
  let pedidoRepo: Repository<Pedido>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: getRepositoryToken(Pedido),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PedidoProduto),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
    pedidoRepo = module.get<Repository<Pedido>>(getRepositoryToken(Pedido));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um pedido', async () => {
    const mockDto: CriarPedidoDto = {
      usuarioId: 1,
      enderecoId: 1,
      produtos: [
        { produtoId: 10, quantidade: 2 },
        { produtoId: 11, quantidade: 1 },
      ],
    };

    const mockResultado = {
      id: 99,
      usuario: { id: 1 },
      endereco: { id: 1 },
      pedidoProdutos: [],
      status: 'pendente',
    } as unknown as Pedido;;

    jest.spyOn(pedidoRepo, 'save').mockResolvedValue(mockResultado as Pedido);

    const result = await service.criarPedido(mockDto);
    expect(result.status).toBe('pendente');
    expect(result.usuario.id).toBe(1);
  });
});