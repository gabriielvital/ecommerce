import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Produto } from '../src/produto/produto.entity';

describe('E2E - Carrinho (CRUD + Checkout)', () => {
  let app: INestApplication;
  let server: any;
  let token: string;
  let userId: number;
  let produtoId: number;
  let enderecoId: number;
  let itemId: number;
  const suffix = Date.now();
  const username = `user_${suffix}`;
  const email = `user_${suffix}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
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
    userId = res.body.id;
    expect(userId).toBeDefined();
  });

  it('deve realizar login e obter token JWT', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ username, password: 'secret' })
      .expect(201);
    expect(res.body.access_token).toBeDefined();
    token = res.body.access_token;
  });

  it('deve criar um produto diretamente via repositório (setup)', async () => {
    const repo = app.get<any>(getRepositoryToken(Produto));
    const saved = await repo.save({ nome: 'Refrigerante Lata', preco: 6.5, imagem: 'http://img/refri.jpg' });
    produtoId = saved.id;
    expect(produtoId).toBeDefined();
  });

  it('deve criar um endereço (AUTH)', async () => {
    const res = await request(server)
      .post('/enderecos')
      .set('Authorization', `Bearer ${token}`)
      .send({ rua: 'Rua B', numero: '321', bairro: 'Centro' })
      .expect(201);
    enderecoId = res.body.id;
    expect(enderecoId).toBeDefined();
  });

  it('deve iniciar com carrinho vazio', async () => {
    const res = await request(server)
      .get('/carrinho')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.itens)).toBe(true);
    expect(res.body.itens.length).toBe(0);
  });

  it('deve falhar checkout com carrinho vazio', async () => {
    await request(server)
      .post('/carrinho/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ enderecoId })
      .expect(400);
  });

  it('deve retornar 404 ao adicionar produto inexistente', async () => {
    await request(server)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: 99999999, quantidade: 1 })
      .expect(404);
  });

  it('deve rejeitar DTO inválido (quantidade não numérica)', async () => {
    await request(server)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId, quantidade: 'abc' })
      .expect(400);
  });

  it('deve adicionar item ao carrinho', async () => {
    const res = await request(server)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId, quantidade: 2 })
      .expect(201);
    expect(res.body.itens.length).toBe(1);
    itemId = res.body.itens[0].id;
    expect(itemId).toBeDefined();
  });

  it('deve somar quantidade ao adicionar o mesmo produto novamente', async () => {
    const res = await request(server)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId, quantidade: 3 })
      .expect(201);
    const item = res.body.itens.find((i: any) => i.id === itemId) || res.body.itens[0];
    expect(item.quantidade).toBe(5);
  });

  it('deve atualizar quantidade do item', async () => {
    const res = await request(server)
      .put(`/carrinho/itens/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantidade: 3 })
      .expect(200);
    const item = res.body.itens.find((i: any) => i.id === itemId);
    expect(item.quantidade).toBe(3);
  });

  it('deve rejeitar atualização com quantidade inválida (<= 0)', async () => {
    await request(server)
      .put(`/carrinho/itens/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantidade: 0 })
      .expect(400);
  });

  it('deve retornar 404 ao atualizar item inexistente', async () => {
    await request(server)
      .put(`/carrinho/itens/99999999`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantidade: 1 })
      .expect(404);
  });

  it('deve remover item do carrinho', async () => {
    const res = await request(server)
      .delete(`/carrinho/itens/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.itens.length).toBe(0);
  });

  it('deve retornar 400 ao remover com id não numérico', async () => {
    await request(server)
      .delete('/carrinho/itens/abc')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('deve retornar 404 ao remover item inexistente', async () => {
    await request(server)
      .delete('/carrinho/itens/99999999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('deve adicionar item novamente e realizar checkout', async () => {
    await request(server)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId, quantidade: 2 })
      .expect(201);

    const res = await request(server)
      .post('/carrinho/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ enderecoId })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.usuario.id).toBe(userId);
    expect(res.body.endereco.id).toBe(enderecoId);

    // carrinho deve estar vazio depois do checkout
    const resCart = await request(server)
      .get('/carrinho')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(resCart.body.itens.length).toBe(0);
  });

  it('deve rejeitar checkout sem enderecoId (DTO inválido) mesmo com itens', async () => {
    // adiciona um item novamente
    await request(server)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId, quantidade: 1 })
      .expect(201);

    await request(server)
      .post('/carrinho/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    // limpa o carrinho para não interferir nos próximos
    const resAfter = await request(server)
      .get('/carrinho')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    // se ainda tem item, remove-o
    if (resAfter.body.itens.length > 0) {
      await request(server)
        .delete(`/carrinho/itens/${resAfter.body.itens[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    }
  });

  it('deve exigir autenticação nas rotas do carrinho (401)', async () => {
    await request(server).get('/carrinho').expect(401);
    await request(server)
      .post('/carrinho/itens')
      .send({ produtoId, quantidade: 1 })
      .expect(401);
  });

  it('deve isolar carrinhos por usuário (não pode remover item de outro usuário)', async () => {
    // cria segundo usuário
    const suffix2 = Date.now();
    const username2 = `user2_${suffix2}`;
    const email2 = `user2_${suffix2}@example.com`;

    const resUser2 = await request(server)
      .post('/usuarios')
      .send({ username: username2, email: email2, password: 'secret' })
      .expect(201);
    const user2Id = resUser2.body.id;
    expect(user2Id).toBeDefined();

    const resLogin2 = await request(server)
      .post('/auth/login')
      .send({ username: username2, password: 'secret' })
      .expect(201);
    const token2 = resLogin2.body.access_token;

    // user2 adiciona item
    const resAdd2 = await request(server)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token2}`)
      .send({ produtoId, quantidade: 1 })
      .expect(201);
    const otherItemId = resAdd2.body.itens[0].id;

    // user1 tenta remover item de user2 -> deve dar 404 (não encontrado para este usuário)
    await request(server)
      .delete(`/carrinho/itens/${otherItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
