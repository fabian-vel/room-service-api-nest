-- consumo de cada habitación en el rango, sin pedidos cancelados
SELECT P.pedi_habitacion,
       COUNT(*)          AS pedidos,
       SUM(P.pedi_total) AS total
FROM tbl_pedidos P
         INNER JOIN mst_estados_pedido E
                    ON E.espe_id = P.pedi_estado_pedido
WHERE P.pedi_estado = 'A'
  AND P.pedi_fecha_eliminacion IS NULL
  AND E.espe_llave_mst <> 'ESTA_PEDI_CANC'
  AND P.pedi_fecha_creacion >= CAST(:fechaDesde AS date)
  AND P.pedi_fecha_creacion < CAST(:fechaHasta AS date) + INTERVAL '1 day'
GROUP BY P.pedi_habitacion
ORDER BY total DESC
