import { IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProdutoQuantidadeDto {
  @IsNumber()
  produtoId: number;

  @IsNumber()
  quantidade: number;
}

export class AtualizarPedidoDto {
  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsNumber()
  enderecoId?: number;

  @IsOptional()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoQuantidadeDto)
  produtos?: ProdutoQuantidadeDto[];
}