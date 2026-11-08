SELECT espe_id,
       espe_llave_mst,
       espe_nombre
FROM mst_estados_pedido
WHERE espe_llave_mst = :llave
  AND espe_estado = 'A'
  AND espe_fecha_eliminacion IS NULL
