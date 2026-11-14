-- los ítems más vendidos del rango por cantidad, sin pedidos cancelados
SELECT MI.meit_id,
       MI.meit_nombre,
       SUM(PD.pede_cantidad) AS cantidad,
       SUM(PD.pede_subtotal) AS total
FROM tbl_pedido_detalle PD
         INNER JOIN tbl_pedidos P
                    ON P.pedi_id = PD.pedi_id
         INNER JOIN mst_estados_pedido E
                    ON E.espe_id = P.pedi_estado_pedido
         INNER JOIN tbl_menu_items MI
                    ON MI.meit_id = PD.meit_id
WHERE PD.pede_estado = 'A'
  AND PD.pede_fecha_eliminacion IS NULL
  AND P.pedi_estado = 'A'
  AND P.pedi_fecha_eliminacion IS NULL
  AND E.espe_llave_mst <> 'ESTA_PEDI_CANC'
  AND P.pedi_fecha_creacion >= CAST(:fechaDesde AS date)
  AND P.pedi_fecha_creacion < CAST(:fechaHasta AS date) + INTERVAL '1 day'
GROUP BY MI.meit_id,
         MI.meit_nombre
ORDER BY cantidad DESC, total DESC
LIMIT :limite
