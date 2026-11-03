SELECT P.pedi_id,
       P.pedi_habitacion,
       P.pedi_total,
       P.pedi_fecha_creacion,
       P.pedi_observacion,
       E.espe_id,
       E.espe_nombre,
       JSON_AGG(
               JSON_BUILD_OBJECT(
                       'meitId', MI.meit_id,
                       'meitNombre', MI.meit_nombre,
                       'pedeCantidad', PD.pede_cantidad,
                       'pedeSubtotal', PD.pede_subtotal
               )
       ) FILTER (WHERE PD.pede_estado = 'A') AS pedido_detalle
FROM tbl_pedidos P
         INNER JOIN mst_estados_pedido E
                    ON E.espe_id = P.pedi_estado_pedido
         LEFT JOIN tbl_pedido_detalle PD
                   ON PD.pedi_id = P.pedi_id
                       AND PD.pede_estado = 'A'
                       AND PD.pede_fecha_eliminacion IS NULL
         LEFT JOIN tbl_menu_items MI
                   ON MI.meit_id = PD.meit_id
WHERE P.haac_id = :haacId
  AND P.pedi_estado = 'A'
  AND P.pedi_fecha_eliminacion IS NULL
GROUP BY P.pedi_id,
         P.pedi_habitacion,
         P.pedi_total,
         P.pedi_fecha_creacion,
         P.pedi_observacion,
         E.espe_id,
         E.espe_nombre
ORDER BY P.pedi_fecha_creacion DESC