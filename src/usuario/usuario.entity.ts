import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Endereco } from '../endereco/endereco.entity';
import { Pedido } from '../pedido/pedido.entity';

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({})
    name: string;

    @Column({ unique: true})
    email: string;

    @Column()
    password: string;

    @OneToMany(() => Endereco, endereco => endereco.usuario, {cascade: true})
    enderecos: Endereco[];

    @OneToMany(() => Pedido, pedido => pedido.cliente)
    pedidos: Pedido[];
}