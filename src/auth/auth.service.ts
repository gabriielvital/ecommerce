import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string): Promise<any>{
        const user = await this.usuarioService.findOne(username);
        if (user && (await bcrypt.compare(password, user.password))){
            return { id: user.id, username: user.username, role: user.role };
        }
        throw new UnauthorizedException('Credenciais Inválidas !');
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }
    

}
