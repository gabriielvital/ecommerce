import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FormaPagamento } from '../pedido.entity'

class ItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  produtoId: number

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantidade: number
}

export class CheckoutGuestDto {
  @ApiProperty({ type: [ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  itens: ItemDto[]

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  nomeCliente: string

  @ApiProperty({ example: '(11) 98765-4321' })
  @IsString()
  @IsNotEmpty()
  telefone: string

  @ApiProperty({ example: 'Rua A' })
  @IsString()
  rua: string

  @ApiProperty({ example: '123' })
  @IsString()
  numero: string

  @ApiProperty({ example: 'Centro' })
  @IsString()
  bairro: string

  @ApiPropertyOptional({ example: 'Apto 21' })
  @IsOptional()
  @IsString()
  complemento?: string

  @ApiProperty({ enum: FormaPagamento, example: FormaPagamento.DINHEIRO })
  @IsEnum(FormaPagamento)
  formaPagamento: FormaPagamento

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  trocoPara?: number
}
