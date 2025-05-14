import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PedidoProduto } from 'src/pedido/pedido-produto.entity';

@Entity()
export class Produto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column('decimal')
    preco: number;

    @Column()
    imagem:string;
    
    @OneToMany(() => PedidoProduto, pedidoProduto => pedidoProduto.produto)
    pedidoProdutos: PedidoProduto[];

}