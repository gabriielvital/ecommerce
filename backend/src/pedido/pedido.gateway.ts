import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PedidoGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(PedidoGateway.name);

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        this.logger.log(`Client connected ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected ${client.id}`);
    }

    @SubscribeMessage('joinPedido')
    joinPedido(@MessageBody() data: { pedidoId: number }, @ConnectedSocket() client: Socket) {
        client.join(`pedido:${data.pedidoId}`);
        return { ok: true };
    }

    @SubscribeMessage('joinUsuario')
    joinUsuario(@MessageBody() data: { usuarioId: number }, @ConnectedSocket() client: Socket) {
        client.join(`usuario:${data.usuarioId}`);
        return { ok: true };
    }

    emitPedidoCriado(pedido: any) {
        // Para pedidos de convidado, não há usuario. Só emite para sala do usuário se existir.
        const userId = pedido?.usuario?.id;
        if (userId) {
            this.server.to(`usuario:${userId}`).emit('pedidoCriado', pedido);
        }
    }

    emitStatusAtualizado(pedido: any) {
        this.server.to(`pedido:${pedido.id}`).emit('statusAtualizado', { id: pedido.id, status: pedido.status });
        const userId = pedido?.usuario?.id;
        if (userId) {
            this.server.to(`usuario:${userId}`).emit('statusAtualizado', { id: pedido.id, status: pedido.status });
        }
    }
}



