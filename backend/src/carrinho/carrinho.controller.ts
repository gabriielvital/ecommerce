import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CarrinhoService } from './carrinho.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { User, AuthUser } from '../common/decorators/user.decorator';

@ApiTags('carrinho')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Get()
  @ApiOperation({ summary: 'Obter carrinho do usuário autenticado' })
  @ApiOkResponse({ description: 'Carrinho do usuário' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
  get(@User() user: AuthUser) {
    return this.carrinhoService.obterCarrinho(user.id);
  }

  @Post('itens')
  @ApiOperation({ summary: 'Adicionar/atualizar item no carrinho' })
  @ApiOkResponse({ description: 'Item adicionado/atualizado no carrinho' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
  addItem(@User() user: AuthUser, @Body() dto: AddItemDto) {
    return this.carrinhoService.adicionarItem(user.id, dto);
  }

  @Put('itens/:id')
  @ApiOperation({ summary: 'Atualizar quantidade de um item do carrinho' })
  @ApiOkResponse({ description: 'Item atualizado' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID do item no carrinho' })
  updateItem(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateItemDto) {
    return this.carrinhoService.atualizarItem(user.id, id, dto);
  }

  @Delete('itens/:id')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiOkResponse({ description: 'Item removido' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID do item no carrinho' })
  removeItem(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.carrinhoService.removerItem(user.id, id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Finalizar compra a partir do carrinho' })
  @ApiOkResponse({ description: 'Pedido criado a partir do carrinho' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
  checkout(@User() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.carrinhoService.checkout(user.id, dto.enderecoId);
  }
}
