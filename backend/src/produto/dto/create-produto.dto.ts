import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProdutoDto {
    @ApiProperty({ example: 'Pizza Calabresa' })
    @IsString()
    nome: string;

    @ApiProperty({ example: 49.9, description: 'Preço em reais' })
    @IsNumber()
    preco: number;

    @ApiProperty({ example: 'https://exemplo.com/imagens/pizza.jpg' })
    @IsString()
    imagem: string;
}



