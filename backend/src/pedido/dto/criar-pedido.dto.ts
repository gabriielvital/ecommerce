import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CriarPedidoProdutoDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    produtoId: number;

    @ApiProperty({ example: 2 })
    @IsNumber()
    quantidade: number;
}

export class CriarPedidoDto {
    @ApiPropertyOptional({ example: 1, description: 'ID do usuário (opcional se autenticado)' })
    @IsNumber()
    usuarioId?: number;

    @ApiProperty({ example: 1, description: 'ID do endereço de entrega' })
    @IsNumber()
    enderecoId: number;

    @ApiProperty({ type: [CriarPedidoProdutoDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CriarPedidoProdutoDto)
    produtos: CriarPedidoProdutoDto[];
}