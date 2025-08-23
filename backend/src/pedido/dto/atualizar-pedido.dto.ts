import { IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PedidoStatus } from '../pedido.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

class ProdutoQuantidadeDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  produtoId: number;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  quantidade: number;
}

export class AtualizarPedidoDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  enderecoId?: number;

  @ApiPropertyOptional({ enum: PedidoStatus })
  @IsOptional()
  @IsEnum(PedidoStatus)
  status?: PedidoStatus;

  @ApiPropertyOptional({ type: [ProdutoQuantidadeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoQuantidadeDto)
  produtos?: ProdutoQuantidadeDto[];
}