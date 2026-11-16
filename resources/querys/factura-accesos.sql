-- accesos con su saldo (lo consumido sin pagar, sin cancelados); sin filtros, solo los que deben
SELECT A.haac_id,
       A.haac_habitacion,
       A.haac_cliente_nombre,
       A.haac_cliente_doc,
       A.haac_fecha_inicio,
       A.haac_fecha_fin,
       COALESCE(SUM(P.pedi_total) FILTER (WHERE P.pago_id IS NULL), 0) AS total_pendiente,
       COUNT(P.pedi_id) FILTER (WHERE P.pago_id IS NULL
           AND P.espe_llave_mst <> 'ESTA_PEDI_ENTR')                   AS pedidos_sin_entregar
FROM tbl_habitacion_acceso A
         LEFT JOIN (SELECT PE.haac_id, PE.pedi_id, PE.pedi_total, PE.pago_id, E.espe_llave_mst
                    FROM tbl_pedidos PE
                             INNER JOIN mst_estados_pedido E
                                        ON E.espe_id = PE.pedi_estado_pedido
                    WHERE PE.pedi_estado = 'A'
                      AND PE.pedi_fecha_eliminacion IS NULL
                      AND E.espe_llave_mst <> 'ESTA_PEDI_CANC') P
                   ON P.haac_id = A.haac_id
WHERE A.haac_fecha_eliminacion IS NULL
  AND (CAST(:haacId AS bigint) IS NULL OR A.haac_id = :haacId)
  AND (CAST(:habitacion AS varchar) IS NULL OR A.haac_habitacion = :habitacion)
GROUP BY A.haac_id
HAVING CAST(:haacId AS bigint) IS NOT NULL
    OR CAST(:habitacion AS varchar) IS NOT NULL
    OR SUM(P.pedi_total) FILTER (WHERE P.pago_id IS NULL) > 0
ORDER BY A.haac_fecha_inicio DESC
LIMIT 50
