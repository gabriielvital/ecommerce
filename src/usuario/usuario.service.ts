import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcryptjs';
import { Role } from '../auth/role.enum';

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
    ) {}

    async findOne(username: string): Promise<Usuario | null> {
        return this.usuarioRepository.findOne({ where: { username } });
    }

    async create(username: string, email: string, password: string): Promise<Usuario> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const usuario = this.usuarioRepository.create({ username, email, password: hashedPassword });
        return this.usuarioRepository.save(usuario);
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        return this.usuarioRepository.findOne({ where: { email } });
    }

    async promoteToAdmin(userId: number): Promise<Usuario> {
        await this.usuarioRepository.update(userId, { role: Role.ADMIN });
        const usuario = await this.usuarioRepository.findOne({ where: { id: userId } });
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        return usuario;
    }
}