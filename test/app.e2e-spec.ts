import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PedidoStatus } from '../src/pedido/pedido.entity';

describe('E2E - Fluxo completo e transições de status', () => {
  let app: INestApplication<App>;
  let server: any;
  let token: string;
  let adminId: number;
  let produtoId: number;
  let enderecoId: number;
  let pedidoId: number;
  const suffix = Date.now();
  const username = `admin_${suffix}`;
  const email = `admin_${suffix}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('deve criar usuário comum', async () => {
    const res = await request(server)
      .post('/usuarios')
      .send({ username, email, password: 'secret' })
      .expect(201);
    adminId = res.body.id;
    expect(adminId).toBeDefined();
  });

  it('deve promover usuário a ADMIN (setup)', async () => {
    await request(server)
      .post(`/usuarios/${adminId}/promote`)
      .set('x-setup-token', 'setup-secret')
      .expect(201);
  });

  it('deve realizar login e obter token JWT', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ username, password: 'secret' })
      .expect(201);
    expect(res.body.access_token).toBeDefined();
    token = res.body.access_token;
    // Verifica role no token
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    expect(payload.role).toBe('admin');
  });

  it('deve criar um produto (ADMIN)', async () => {
    const res = await request(server)
      .post('/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Pizza Calabresa', preco: 49.9, imagem: 'http://img/pizza.jpg' })
      .expect(201);
    produtoId = res.body.id;
    expect(produtoId).toBeDefined();
  });

  it('deve criar um endereço (AUTH)', async () => {
    const res = await request(server)
      .post('/enderecos')
      .set('Authorization', `Bearer ${token}`)
      .send({ rua: 'Rua A', numero: '123', bairro: 'Centro', usuarioId: adminId })
      .expect(201);
    enderecoId = res.body.id;
    expect(enderecoId).toBeDefined();
  });

  it('deve criar um pedido (ADMIN)', async () => {
    const res = await request(server)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ usuarioId: adminId, enderecoId, produtos: [{ produtoId, quantidade: 2 }] })
      .expect(201);
    pedidoId = res.body.id;
    expect(pedidoId).toBeDefined();
    expect(res.body.status).toBe(PedidoStatus.PENDENTE);
  });

  it('deve permitir transição PENDENTE -> PREPARANDO', async () => {
    const res = await request(server)
      .put(`/pedidos/${pedidoId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: PedidoStatus.PREPARANDO })
      .expect(200);
    expect(res.body.status).toBe(PedidoStatus.PREPARANDO);
  });

  it('deve permitir transição PREPARANDO -> SAIU_PARA_ENTREGA', async () => {
    const res = await request(server)
      .put(`/pedidos/${pedidoId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: PedidoStatus.SAIU_PARA_ENTREGA })
      .expect(200);
    expect(res.body.status).toBe(PedidoStatus.SAIU_PARA_ENTREGA);
  });

  it('deve rejeitar transição inválida SAIU_PARA_ENTREGA -> CANCELADO', async () => {
    await request(server)
      .put(`/pedidos/${pedidoId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: PedidoStatus.CANCELADO })
      .expect(400);
  });

  it('deve permitir transição SAIU_PARA_ENTREGA -> ENTREGUE', async () => {
    const res = await request(server)
      .put(`/pedidos/${pedidoId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: PedidoStatus.ENTREGUE })
      .expect(200);
    expect(res.body.status).toBe(PedidoStatus.ENTREGUE);
  });

  it('deve rejeitar transição inválida ENTREGUE -> PREPARANDO', async () => {
    await request(server)
      .put(`/pedidos/${pedidoId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: PedidoStatus.PREPARANDO })
      .expect(400);
  });
});
