import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Endereco } from '../endereco/endereco.entity';
import { Pedido } from '../pedido/pedido.entity';
import { Role } from '../auth/role.enum';

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true})
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: Role, default: Role.CLIENTE })
    role: Role;

    @OneToMany(() => Endereco, endereco => endereco.usuario, {cascade: true})
    enderecos: Endereco[];

    @OneToMany(() => Pedido, pedido => pedido.usuario)
    pedidos: Pedido[];
}