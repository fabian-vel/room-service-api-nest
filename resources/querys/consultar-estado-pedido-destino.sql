SELECT espe_id,
       espe_llave_mst,
       espe_nombre
FROM mst_estados_pedido
WHERE espe_id = :espeId
  AND espe_estado = 'A'
  AND espe_fecha_eliminacion IS NULL
