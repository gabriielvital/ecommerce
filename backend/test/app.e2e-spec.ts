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
    // Relations must be present
    expect(res.body.usuario?.id).toBe(adminId);
    expect(res.body.endereco?.id).toBe(enderecoId);
    expect(Array.isArray(res.body.pedidoProdutos)).toBe(true);
    expect(res.body.pedidoProdutos[0]?.produto?.id).toBe(produtoId);
    // Total deve ser preco * quantidade (49.9 * 2 = 99.8)
    expect(Number(res.body.total)).toBeCloseTo(99.8, 2);
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

  it('deve impedir que usuário COMUM crie produto (403)', async () => {
    // cria usuário comum
    const suffix2 = Date.now();
    const username2 = `user_${suffix2}`;
    const email2 = `user_${suffix2}@example.com`;
    await request(server)
      .post('/usuarios')
      .send({ username: username2, email: email2, password: 'secret' })
      .expect(201);
    const resLogin = await request(server)
      .post('/auth/login')
      .send({ username: username2, password: 'secret' })
      .expect(201);
    const userToken = resLogin.body.access_token;

    await request(server)
      .post('/produtos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nome: 'Produto Não Autorizado', preco: 10, imagem: 'http://img/x.jpg' })
      .expect(403);
  });

  it('deve impedir que usuário COMUM liste todos os pedidos (403)', async () => {
    const suffix3 = Date.now();
    const username3 = `user_${suffix3}`;
    const email3 = `user_${suffix3}@example.com`;
    await request(server)
      .post('/usuarios')
      .send({ username: username3, email: email3, password: 'secret' })
      .expect(201);
    const resLogin = await request(server)
      .post('/auth/login')
      .send({ username: username3, password: 'secret' })
      .expect(201);
    const userToken = resLogin.body.access_token;

    await request(server)
      .get('/pedidos')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('deve impedir que usuário COMUM atualize status de pedido (403)', async () => {
    const suffix4 = Date.now();
    const username4 = `user_${suffix4}`;
    const email4 = `user_${suffix4}@example.com`;
    // cria user e login
    await request(server)
      .post('/usuarios')
      .send({ username: username4, email: email4, password: 'secret' })
      .expect(201);
    const resLogin = await request(server)
      .post('/auth/login')
      .send({ username: username4, password: 'secret' })
      .expect(201);
    const userToken = resLogin.body.access_token;

    await request(server)
      .put(`/pedidos/${pedidoId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: PedidoStatus.PREPARANDO })
      .expect(403);
  });

  it('deve permitir que usuário COMUM crie seu próprio pedido sem enviar usuarioId (inferido do JWT)', async () => {
    // cria user e login
    const suffix5 = Date.now();
    const username5 = `user_${suffix5}`;
    const email5 = `user_${suffix5}@example.com`;
    const resUser = await request(server)
      .post('/usuarios')
      .send({ username: username5, email: email5, password: 'secret' })
      .expect(201);
    const userId5 = resUser.body.id;
    const resLogin = await request(server)
      .post('/auth/login')
      .send({ username: username5, password: 'secret' })
      .expect(201);
    const userToken = resLogin.body.access_token;

    // cria endereco para o user5
    const resEnd = await request(server)
      .post('/enderecos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rua: 'Rua C', numero: '10', bairro: 'Centro' })
      .expect(201);
    const endereco5 = resEnd.body.id;

    // cria pedido sem usuarioId
    const resPedido = await request(server)
      .post('/pedidos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ enderecoId: endereco5, produtos: [{ produtoId, quantidade: 1 }] })
      .expect(201);
    expect(resPedido.body.usuario.id).toBe(userId5);
  });

  it('deve aplicar regra de dono-ou-admin em GET /pedidos/:id (403 para outro usuário)', async () => {
    // cria usuário comum X
    const s = Date.now();
    const usernameX = `userx_${s}`;
    const emailX = `userx_${s}@example.com`;
    await request(server)
      .post('/usuarios')
      .send({ username: usernameX, email: emailX, password: 'secret' })
      .expect(201);
    const resLoginX = await request(server)
      .post('/auth/login')
      .send({ username: usernameX, password: 'secret' })
      .expect(201);
    const tokenX = resLoginX.body.access_token;

    // X tenta acessar pedido do admin -> 403
    await request(server)
      .get(`/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${tokenX}`)
      .expect(403);

    // admin pode acessar -> 200
    const resAdminGet = await request(server)
      .get(`/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(resAdminGet.body.id).toBe(pedidoId);
  });

  it('deve aplicar regra em GET /pedidos/usuario/:usuarioId (self OK, outro 403, admin OK)', async () => {
    // self: admin lista seus pedidos -> 200
    await request(server)
      .get(`/pedidos/usuario/${adminId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // cria outro usuário comum Y com pedido próprio
    const sy = Date.now();
    const usernameY = `usery_${sy}`;
    const emailY = `usery_${sy}@example.com`;
    const resUserY = await request(server)
      .post('/usuarios')
      .send({ username: usernameY, email: emailY, password: 'secret' })
      .expect(201);
    const userIdY = resUserY.body.id;
    const resLoginY = await request(server)
      .post('/auth/login')
      .send({ username: usernameY, password: 'secret' })
      .expect(201);
    const tokenY = resLoginY.body.access_token;

    // cria endereco para Y
    const resEndY = await request(server)
      .post('/enderecos')
      .set('Authorization', `Bearer ${tokenY}`)
      .send({ rua: 'Rua Y', numero: '5', bairro: 'Centro' })
      .expect(201);
    const endY = resEndY.body.id;

    // cria pedido do Y
    await request(server)
      .post('/pedidos')
      .set('Authorization', `Bearer ${tokenY}`)
      .send({ enderecoId: endY, produtos: [{ produtoId, quantidade: 1 }] })
      .expect(201);

    // Y lista seus pedidos -> 200
    await request(server)
      .get(`/pedidos/usuario/${userIdY}`)
      .set('Authorization', `Bearer ${tokenY}`)
      .expect(200);

    // Y tenta listar pedidos do admin -> 403
    await request(server)
      .get(`/pedidos/usuario/${adminId}`)
      .set('Authorization', `Bearer ${tokenY}`)
      .expect(403);

    // admin lista pedidos de Y -> 200
    await request(server)
      .get(`/pedidos/usuario/${userIdY}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('deve exigir autenticação (401) em rotas protegidas de pedidos', async () => {
    await request(server)
      .get('/pedidos')
      .expect(401);

    await request(server)
      .post('/pedidos')
      .send({ enderecoId, produtos: [{ produtoId, quantidade: 1 }] })
      .expect(401);

    await request(server)
      .put(`/pedidos/${pedidoId}/status`)
      .send({ status: PedidoStatus.PREPARANDO })
      .expect(401);
  });
});
