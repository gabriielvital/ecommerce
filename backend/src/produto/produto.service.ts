import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';

@Injectable()
export class ProdutoService {
    constructor(
        @InjectRepository(Produto)
        private produtoRepository: Repository<Produto>
    ){}

    listar(): Promise<Produto[]> {
        return this.produtoRepository.find();
    }

    criar(produto: Produto): Promise<Produto> {
        return this.produtoRepository.save(produto);
    }

    async deletar(id: number): Promise<void> {
        const result = await this.produtoRepository.softDelete(id)
        if (!result.affected) {
            throw new BadRequestException('Produto não encontrado.')
        }
    }

    async atualizar(id: number, dados: Partial<Produto>): Promise<void> {
        await this.produtoRepository.update(id,dados);
    }

}