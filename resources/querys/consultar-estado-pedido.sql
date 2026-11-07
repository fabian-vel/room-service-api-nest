SELECT P.pedi_id,
       P.haac_id,
       E.espe_id,
       E.espe_llave_mst,
       E.espe_nombre
FROM tbl_pedidos P
         INNER JOIN mst_estados_pedido E
                    ON E.espe_id = P.pedi_estado_pedido
WHERE P.pedi_id = :pediId
  AND P.pedi_estado = 'A'
  AND P.pedi_fecha_eliminacion IS NULL
FOR UPDATE OF P
