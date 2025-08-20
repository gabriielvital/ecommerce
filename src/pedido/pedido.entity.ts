import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { PedidoProduto } from './pedido-produto.entity';
import { Endereco } from '../endereco/endereco.entity';
import { Usuario } from '../usuario/usuario.entity';

export enum PedidoStatus {
    PENDENTE = 'PENDENTE',
    PREPARANDO = 'PREPARANDO',
    SAIU_PARA_ENTREGA = 'SAIU_PARA_ENTREGA',
    ENTREGUE = 'ENTREGUE',
    CANCELADO = 'CANCELADO',
}

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Usuario, usuario => usuario.pedidos)
    usuario: Usuario;

    @ManyToOne(() => Endereco)
    endereco: Endereco;

    @Column({ type: 'enum', enum: PedidoStatus, default: PedidoStatus.PENDENTE })
    status: PedidoStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @OneToMany(() => PedidoProduto, pedidoProduto => pedidoProduto.pedido, {cascade: true})
    pedidoProdutos: PedidoProduto[];
}