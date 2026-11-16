-- pedidos del acceso sin cancelados, con su detalle; pago_id NULL = pendiente de cobro
SELECT P.pedi_id,
       P.pedi_fecha_creacion,
       P.pedi_total,
       P.pago_id,
       E.espe_nombre,
       E.espe_llave_mst,
       (SELECT json_agg(json_build_object(
                                'meitNombre', I.meit_nombre,
                                'cantidad', D.pede_cantidad,
                                'precioUnitario', D.pede_precio_unitario,
                                'subtotal', D.pede_subtotal,
                                'observacion', D.pede_observacion
                        ) ORDER BY D.pede_id)
        FROM tbl_pedido_detalle D
                 INNER JOIN tbl_menu_items I
                            ON I.meit_id = D.meit_id
        WHERE D.pedi_id = P.pedi_id
          AND D.pede_estado = 'A'
          AND D.pede_fecha_eliminacion IS NULL) AS detalle
FROM tbl_pedidos P
         INNER JOIN mst_estados_pedido E
                    ON E.espe_id = P.pedi_estado_pedido
WHERE P.haac_id = :haacId
  AND P.pedi_estado = 'A'
  AND P.pedi_fecha_eliminacion IS NULL
  AND E.espe_llave_mst <> 'ESTA_PEDI_CANC'
ORDER BY P.pedi_fecha_creacion ASC
