import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnderecoDto {
    @ApiProperty({ example: 'Rua das Flores' })
    @IsString()
    rua: string;

    @ApiProperty({ example: '123' })
    @IsString()
    numero: string;

    @ApiProperty({ example: 'Centro' })
    @IsString()
    bairro: string;

    @ApiPropertyOptional({ example: 'Apto 45' })
    @IsOptional()
    @IsString()
    complemento?: string;

    @ApiPropertyOptional({ example: 1, description: 'ID do usuário proprietário do endereço (opcional se autenticado)' })
    @IsOptional()
    @IsNumber()
    usuarioId?: number;
}



