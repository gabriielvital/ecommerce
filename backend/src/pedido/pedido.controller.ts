import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { PedidoService } from './pedido.service';
import { Pedido } from './pedido.entity';
import { CheckoutGuestDto } from './dto/checkout-guest.dto';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { AtualizarPedidoDto } from './dto/atualizar-pedido.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiParam, ApiOperation } from '@nestjs/swagger';
import { User, AuthUser } from '../common/decorators/user.decorator';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidoController {
    constructor( private readonly pedidoService: PedidoService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos os pedidos (ADMIN)' })
    @Get()
    @ApiOkResponse({ description: 'Lista de pedidos retornada com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Apenas ADMIN pode listar todos os pedidos.' })
    listarPedido(){
        return this.pedidoService.listarPedido();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar pedidos de um usuário (Self ou ADMIN)' })
    @Get('usuario/:usuarioId')
    @ApiOkResponse({ description: 'Lista de pedidos por usuário retornada com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Somente o próprio usuário ou ADMIN podem acessar.' })
    @ApiParam({ name: 'usuarioId', type: Number, example: 1, description: 'ID do usuário dono dos pedidos' })
    listarPorUsuario(@Param('usuarioId', new ParseIntPipe()) usuarioId: number, @User() user: AuthUser) {
        const isSameUser = user?.id === +usuarioId;
        const isAdmin = user?.role === Role.ADMIN;
        if (!isSameUser && !isAdmin) {
            throw new ForbiddenException();
        }
        return this.pedidoService.listarPorUsuario(+usuarioId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Buscar pedido por ID (dono ou ADMIN)' })
    @Get(':id')
    @ApiOkResponse({ description: 'Pedido retornado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Somente o dono do pedido ou ADMIN podem acessar.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do pedido' })
    async buscarPorId(@Param('id', new ParseIntPipe()) id: number, @User() user: AuthUser) {
        const pedido = await this.pedidoService.buscarPorId(+id);
        if (!pedido) return pedido;
        const isOwner = pedido.usuario?.id === user?.id;
        const isAdmin = user?.role === Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException();
        }
        return pedido;
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Criar pedido (usuário autenticado)' })
    @ApiCreatedResponse({ description: 'Pedido criado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @Post()
    criarPedido(@Body() dados: CriarPedidoDto, @User() user: AuthUser) {
        const userId = dados.usuarioId ?? user?.id;
        return this.pedidoService.criarPedido({ ...dados, usuarioId: userId });
    }

    @ApiOperation({ summary: 'Checkout convidado (público)' })
    @ApiCreatedResponse({ description: 'Pedido (guest) criado com sucesso.' })
    @Post('guest')
    checkoutGuest(@Body() dados: CheckoutGuestDto) {
      return this.pedidoService.criarPedidoConvidado(dados)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar pedido (ADMIN)' })
    @ApiOkResponse({ description: 'Pedido atualizado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Apenas ADMIN pode atualizar pedidos.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do pedido' })
    @Put(':id')
    async atualizarPedido(@Param('id') id: number, @Body() dados: AtualizarPedidoDto) {
        return this.pedidoService.atualizarPedido(+id, dados);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar status do pedido (ADMIN)' })
    @ApiOkResponse({ description: 'Status do pedido atualizado com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Apenas ADMIN pode atualizar o status.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do pedido' })
    @Put(':id/status')
    atualizarStatus(@Param('id') id: number, @Body() body: { status: string }){
        return this.pedidoService.atualizarPedido(+id, { status: body.status as any });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Excluir pedido (ADMIN)' })
    @ApiOkResponse({ description: 'Pedido excluído com sucesso.' })
    @ApiUnauthorizedResponse({ description: 'Não autenticado.' })
    @ApiForbiddenResponse({ description: 'Apenas ADMIN pode excluir pedidos.' })
    @ApiParam({ name: 'id', type: Number, example: 10, description: 'ID do pedido' })
    @Delete(':id')
    excluirPedido(@Param('id') id: number){
        return this.pedidoService.excluirPedido(id);
    }
}