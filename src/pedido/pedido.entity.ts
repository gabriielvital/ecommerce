import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { PedidoProduto } from './pedido-produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cliente: string;

    @ManyToOne(() => Usuario, usuario => usuario.pedidos)
    usuario: Usuario;

    @ManyToOne(() => Endereco)
    endereco: Endereco;

    @Column()
    status: string;

    @OneToMany(() => PedidoProduto, pedidoProduto => pedidoProduto.pedido, {cascade: true})
    pedidoProdutos: PedidoProduto[];
}