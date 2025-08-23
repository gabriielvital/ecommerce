import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({ example: 1, description: 'ID do endereço de entrega' })
  @IsNumber()
  enderecoId: number;
}
