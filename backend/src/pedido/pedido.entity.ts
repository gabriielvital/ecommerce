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

export enum FormaPagamento {
    DINHEIRO = 'DINHEIRO',
    CARTAO = 'CARTAO',
    PIX = 'PIX',
}

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Usuario, usuario => usuario.pedidos, { nullable: true })
    usuario: Usuario | null;

    @ManyToOne(() => Endereco, { nullable: true })
    endereco: Endereco | null;

    // Campos de endereço inline (checkout convidado)
    @Column({ nullable: true })
    rua?: string;

    @Column({ nullable: true })
    numero?: string;

    @Column({ nullable: true })
    bairro?: string;

    @Column({ nullable: true })
    complemento?: string;

    @Column({ type: 'enum', enum: PedidoStatus, default: PedidoStatus.PENDENTE })
    status: PedidoStatus;

    // Dados do cliente (convidado ou identificado)
    @Column({ nullable: true })
    nomeCliente?: string;

    @Column({ nullable: true })
    telefone?: string;

    @Column({ type: 'enum', enum: FormaPagamento, nullable: true })
    formaPagamento?: FormaPagamento;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    trocoPara?: number | null;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @OneToMany(() => PedidoProduto, pedidoProduto => pedidoProduto.pedido, {cascade: true})
    pedidoProdutos: PedidoProduto[];
}