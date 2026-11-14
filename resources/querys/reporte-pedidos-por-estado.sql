-- pedidos del rango por estado; los estados sin pedidos salen en cero
SELECT E.espe_id,
       E.espe_nombre,
       COUNT(P.pedi_id)              AS pedidos,
       COALESCE(SUM(P.pedi_total), 0) AS total
FROM mst_estados_pedido E
         LEFT JOIN tbl_pedidos P
                   ON P.pedi_estado_pedido = E.espe_id
                       AND P.pedi_estado = 'A'
                       AND P.pedi_fecha_eliminacion IS NULL
                       AND P.pedi_fecha_creacion >= CAST(:fechaDesde AS date)
                       AND P.pedi_fecha_creacion < CAST(:fechaHasta AS date) + INTERVAL '1 day'
WHERE E.espe_estado = 'A'
  AND E.espe_fecha_eliminacion IS NULL
GROUP BY E.espe_id,
         E.espe_nombre
ORDER BY E.espe_id
