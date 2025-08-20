import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { PedidoService } from './pedido.service';
import { Pedido } from './pedido.entity';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { AtualizarPedidoDto } from './dto/atualizar-pedido.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Req } from '@nestjs/common';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidoController {
    constructor( private readonly pedidoService: PedidoService) {}

    @Get()
    @ApiOkResponse({ description: 'Lista de pedidos retornada com sucesso.' })
    listarPedido(){
        return this.pedidoService.listarPedido();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Pedido retornado com sucesso.' })
    buscarPorId(@Param('id') id: number) {
        return this.pedidoService.buscarPorId(+id);
    }

    @Get('usuario/:usuarioId')
    @ApiOkResponse({ description: 'Lista de pedidos por usuário retornada com sucesso.' })
    listarPorUsuario(@Param('usuarioId') usuarioId: number) {
        return this.pedidoService.listarPorUsuario(+usuarioId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiCreatedResponse({ description: 'Pedido criado com sucesso.' })
    @Post()
    criarPedido(@Body() dados: CriarPedidoDto, @Req() req: any) {
        const userId = dados.usuarioId ?? req.user?.id;
        return this.pedidoService.criarPedido({ ...dados, usuarioId: userId });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Pedido atualizado com sucesso.' })
    @Put(':id')
    async atualizarPedido(@Param('id') id: number, @Body() dados: AtualizarPedidoDto) {
        return this.pedidoService.atualizarPedido(+id, dados);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Status do pedido atualizado com sucesso.' })
    @Put(':id/status')
    atualizarStatus(@Param('id') id: number, @Body() body: { status: string }){
        return this.pedidoService.atualizarPedido(+id, { status: body.status as any });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Pedido excluído com sucesso.' })
    @Delete(':id')
    excluirPedido(@Param('id') id: number){
        return this.pedidoService.excluirPedido(id);
    }
}