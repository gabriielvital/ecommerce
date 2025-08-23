# Projeto Ecommerce - TODO History

Este arquivo registra, de forma histórica e legível, as tarefas acompanhadas durante o desenvolvimento.

Data de geração/atualização: 2025-08-20 15:16:23 -03:00

## Snapshot Atual

- [x] Backend: Implementar recurso Carrinho por usuário (CRUD itens + checkout) — id: be-3
- [x] Carrinho: criar service, controller e module; wire no AppModule; endpoints JWT-only — id: be-3a
- [x] Carrinho: implementar checkout reutilizando PedidoService — id: be-3b
- [x] Limpeza arquitetural: @User decorator tipado e augmentation do Express.User — id: arch-1
- [x] Limpeza arquitetural: proteger rotas admin de pedidos com RolesGuard — id: arch-2
- [x] Limpeza arquitetural: transações em PedidoService e retorno com relações — id: arch-3
- [x] Limpeza arquitetural: remover eager do Carrinho e carregar relações explicitamente — id: arch-4
- [x] Adicionar testes E2E do carrinho (CRUD + checkout) — id: be-3c
- [x] Enriquecer testes E2E: carrinho (erros e casos de borda) — id: qa-1a
  - Casos: checkout vazio 400; somar quantidades ao adicionar mesmo produto; validação quantidade <= 0; id não numérico 400; isolamento de usuários; DTO inválidos; produto inexistente 404; concorrência de adição.
- [x] Enriquecer testes E2E: app (autorização e criação por usuário comum) — id: qa-1b
  - Casos: usuário comum não cria produto (403); não lista pedidos (403); não atualiza status (403); cria pedido inferindo usuário via JWT; endpoints protegidos sem token retornam 401.
- [ ] Swagger: documentar endpoints do Carrinho e revisar DTOs — id: docs-1
- [ ] Paginação nas listagens (ex.: `GET /pedidos`) — id: perf-1
- [ ] Melhorias de performance e carregamento explícito de relações onde necessário — id: perf-2
- [ ] Tratamento de erros padronizado e mensagens consistentes — id: qual-1

## Alterações Recentes

- 2025-08-20 15:10 ~ 15:16
  - Enriquecidos testes E2E do Carrinho com cenários adicionais (vazio 400, soma, validações, id inválido, isolamento, DTO inválidos, produto inexistente, concorrência básica).
  - Enriquecidos testes E2E do App com cenários de autorização e criação de pedido inferindo usuário pelo JWT; validações de 401 em rotas protegidas.
  - Ajuste em `src/carrinho/carrinho.controller.ts`: `ParseIntPipe` nos parâmetros `:id` das rotas de item para evitar NaN.

- 2025-08-20 15:28 ~ 15:29
  - Carrinho: adicionados casos E2E extras — produto inexistente (404), DTO inválido (400), update/delete inexistente (404), checkout sem `enderecoId` (400), e 401 sem token.
  - App: verificação de relações no payload de pedido (usuario, endereco, pedidoProdutos.produto) e 401 em rotas protegidas.
  - TODOs sincronizados: `qa-1a` e `qa-1b` concluídos; `qa-1` permanece em progresso.

- 2025-08-20 (~antes)
  - Criação do módulo de Carrinho (entidades, DTOs, service, controller) e integração ao `AppModule`.
  - Export do `PedidoService` no `PedidoModule` e uso no checkout do carrinho.
  - Introdução do decorator `@User()` tipado e augmentation de `Express.User`.
  - Proteção de rotas admin (`GET /pedidos`, `PUT /pedidos/:id`) com `RolesGuard` e `@Roles`.
  - Transações envolvendo criação e atualização de pedidos; retorno de entidades com relações completas.
  - Remoção de eager loading nas entidades de carrinho para controle explícito de relações.

## Política de Atualização Automática

- Este arquivo será mantido atualizado sempre que criarmos/fecharmos TODOs durante a sessão de desenvolvimento.
- Podemos automatizar via script (ex.: gerar a partir de um JSON/YAML de TODOs), caso queira depois — hoje o update é feito junto das mudanças de código/testes.

