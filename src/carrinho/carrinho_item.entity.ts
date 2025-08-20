import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Carrinho } from './carrinho.entity';
import { Produto } from '../produto/produto.entity';

@Entity()
export class CarrinhoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Carrinho, (c) => c.itens, { onDelete: 'CASCADE' })
  carrinho: Carrinho;

  @ManyToOne(() => Produto, { eager: true, onDelete: 'RESTRICT' })
  produto: Produto;

  @Column('int')
  quantidade: number;
}
