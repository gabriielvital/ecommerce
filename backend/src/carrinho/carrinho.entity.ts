import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { CarrinhoItem } from './carrinho_item.entity';

@Entity()
export class Carrinho {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @OneToMany(() => CarrinhoItem, (item) => item.carrinho, { cascade: true })
  itens: CarrinhoItem[];
}
