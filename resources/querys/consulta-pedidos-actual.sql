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
                       'pedeSubtotal', PD.pede_subtotal,
                       'mecaParentId', MI.meca_parent_id,
                       'mecaId', MI.meca_id,
                       'mecaNombre', MC.meca_nombre
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
         LEFT JOIN mst_menu_categorias MC
                   ON MC.meca_id = MI.meca_id
WHERE P.pedi_estado = 'A'
  AND P.pedi_fecha_eliminacion IS NULL
--AND P.pedi_fecha_creacion::date = CURRENT_DATE
GROUP BY P.pedi_id,
         P.pedi_habitacion,
         P.pedi_total,
         P.pedi_fecha_creacion,
         P.pedi_observacion,
         E.espe_id,
         E.espe_nombre
ORDER BY P.pedi_fecha_creacion ASC