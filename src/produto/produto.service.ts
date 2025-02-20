import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';

@Injectable()
export class ProdutoService {
    constructor(
        @InjectRepository(Produto)
        private produtoRepository: Repository<Produto>,
    ){}

    findAll(): Promise<Produto[]> {
        return this.produtoRepository.find();
    }

    findOne(id: number): Promise<Produto> {
        return this.produtoRepository.findOneBy({ id });
    }

    create(produto: Produto): Promise<Produto> {
        return this.produtoRepository.save(produto);
    }

    delete(id: number): Promise<void> {
        return this.produtoRepository.delete(id).then(() => {});
    }
}