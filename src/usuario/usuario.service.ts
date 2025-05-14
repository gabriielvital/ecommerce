import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
    ) {}

    async findOne(username: string): Promise<Usuario | undefined> {
        return this.usuarioRepository.findOneBy({ username });
    }

    async create(username: string, email: string, password: string): Promise<Usuario> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const usuario = this.usuarioRepository.create({ username, email, password: hashedPassword });
        return this.usuarioRepository.save(usuario);
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        return this.usuarioRepository.findOne({ where: { email }, relations: ['email']});
    }
}