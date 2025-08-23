import { IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  quantidade?: number;
}
