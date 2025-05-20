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

    async listar(): Promise<Endereco[]>{
        return this.enderecoRepository.find();
    }

    async listarPorUsuario(usuarioId: number): Promise<Endereco[]> {
        return this.enderecoRepository.find({
          where: { usuario: { id: usuarioId } },
          relations: ['usuario'],
        });
      }

    async atualizar(id: number, dados: Partial<Endereco>): Promise<Endereco>{
        await this.enderecoRepository.update(id, dados);
        const endereco = await this.enderecoRepository.findOne({where: {id}});
        if (!endereco) {
            throw new Error('Endereço não encontrado');
        }
        return endereco;
    }

    async remover(id: number): Promise<void>{
        await this.enderecoRepository.delete(id);
    }
    
    
}