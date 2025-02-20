import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cliente: string;

    @Column()
    endereco: string;

    @Column()
    status: string;
}