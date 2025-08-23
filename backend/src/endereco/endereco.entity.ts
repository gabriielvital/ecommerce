import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

@Entity()
export class Endereco { 
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rua: string;

    @Column()
    numero: string;

    @Column()
    bairro: string;

    @Column()
    complemento: string;

    @ManyToOne(() => Usuario, usuario => usuario.enderecos)
    usuario: Usuario;
}