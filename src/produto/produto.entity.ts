import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PedidoProduto } from '../pedido/pedido-produto.entity';

@Entity()
export class Produto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column('decimal', { precision: 10, scale: 2 })
    preco: number;

    @Column()
    imagem:string;
    
    @OneToMany(() => PedidoProduto, pedidoProduto => pedidoProduto.produto)
    pedidoProdutos: PedidoProduto[];

}