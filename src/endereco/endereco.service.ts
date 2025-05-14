import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Endereco } from './endereco.entity'

@Injectable()
export class EnderecoService {
    constructor(
        @InjectRepository(Endereco)
        private enderecoRepository: Repository<Endereco>,
    ) {}

    async create(rua: string, numero: string, bairro: string, complemento: string, usuarioId: number): Promise<Endereco>{
        const endereco = this.enderecoRepository.create({rua, numero, bairro, complemento, usuario: {id: usuarioId}});  
        return this.enderecoRepository.save(endereco);
    }

}