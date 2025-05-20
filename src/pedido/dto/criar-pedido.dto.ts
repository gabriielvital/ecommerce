export class CriarPedidoDto {
    usuarioId: number;
    enderecoId: number;
    produtos: {
        produtoId: number;
        quantidade: number;
    }[];
}