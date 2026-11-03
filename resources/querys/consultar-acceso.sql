SELECT haac_id,
       haac_habitacion,
       haac_codigo,
       haac_cliente_nombre,
       haac_cliente_doc,
       haac_fecha_inicio,
       haac_fecha_fin,
       haac_estado
FROM tbl_habitacion_acceso
WHERE haac_habitacion = :habitacion
  AND haac_codigo     = :codigo
  AND haac_fecha_eliminacion IS NULL