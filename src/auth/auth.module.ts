import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuarioModule } from '../usuario/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy.ts';
import { AuthController } from '@nestjs/jwt';

@Module({
    imports: [
        UsuarioModule,
        PassportModule,
        JwtModule.register({secret: 'secreto', signOptions: {expiresIn: '1h'}}),
    ],
    providers: [AuthService, LocalStrategy],
    controllers:[AuthController],
})
export class AuthModule {}