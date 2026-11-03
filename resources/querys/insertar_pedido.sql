INSERT INTO tbl_pedidos (haac_id,
                         pedi_habitacion,
                         pedi_cliente_nombre,
                         pedi_estado_pedido,
                         pedi_observacion,
                         pedi_total)
VALUES (:haacId,
        :habitacion,
        :clienteNombre,
        :estadoPedidoId,
        :observacion,
        :total)
    RETURNING pedi_id