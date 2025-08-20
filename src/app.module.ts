import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdutoModule } from './produto/produto.module';
import { PedidoModule } from './pedido/pedido.module';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { EnderecoModule } from './endereco/endereco.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      process.env.USE_SQLITE === '1'
        ? {
            type: 'sqlite',
            database: 'ecommerce.sqlite',
            autoLoadEntities: true,
            synchronize: true, // desativar em produção
          }
        : {
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 3306),
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'root',
            database: process.env.DB_NAME || 'ecommerce',
            autoLoadEntities: true,
            synchronize: true, // desativar em produção
          },
    ),
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


