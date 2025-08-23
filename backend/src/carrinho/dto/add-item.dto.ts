import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  produtoId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantidade: number;
}
