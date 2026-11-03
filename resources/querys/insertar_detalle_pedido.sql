INSERT INTO tbl_pedido_detalle (pedi_id,
                                meit_id,
                                pede_cantidad,
                                pede_precio_unitario,
                                pede_subtotal,
                                pede_observacion)
VALUES (:pediId,
        :meitId,
        :cantidad,
        :precioUnitario,
        :subtotal,
        :observacion)