import { Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm'
import { Pedido } from './pedido.entity';
import { Produto } from '../produto/produto.entity';

@Entity()
export class PedidoProduto{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Pedido, pedido => pedido.pedidoProdutos)
    pedido: Pedido;

    @ManyToOne(() => Produto, produto => produto.pedidoProdutos)
    produto: Produto;

    @Column()
    quantidade: number;
}