import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdutoModule } from './produto/produto.module';
import { PedidoModule } from './pedido/pedido.module';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { EnderecoModule } from './endereco/endereco.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'ecommerce',
      autoLoadEntities: true,
      synchronize: true, //Ideal desativar em produção!

    }),
    ProdutoModule,
    PedidoModule,
    AuthModule,
    UsuarioModule,
    EnderecoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


