-- pedidos por cobrar del acceso; FOR UPDATE: dos cobros a la vez no toman los mismos pedidos
SELECT P.pedi_id,
       E.espe_llave_mst
FROM tbl_pedidos P
         INNER JOIN mst_estados_pedido E
                    ON E.espe_id = P.pedi_estado_pedido
WHERE P.haac_id = :haacId
  AND P.pago_id IS NULL
  AND P.pedi_estado = 'A'
  AND P.pedi_fecha_eliminacion IS NULL
  AND E.espe_llave_mst <> 'ESTA_PEDI_CANC'
ORDER BY P.pedi_id
FOR UPDATE OF P
