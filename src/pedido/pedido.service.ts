import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedido.entity';

@Injectable()
export class PedidoService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
    ) {}

    findAll(): Promise<Pedido[]> {
        return this.pedidoRepository.find();
    }

    create(pedido: Pedido): Promise<Pedido> {
        return this.pedidoRepository.save(pedido);
    }
}