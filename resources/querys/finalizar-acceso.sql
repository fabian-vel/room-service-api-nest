-- check-out: el acceso queda inactivo y vence ya; sigue visible para la factura
UPDATE tbl_habitacion_acceso
SET haac_estado             = 'I',
    haac_fecha_fin          = LEAST(haac_fecha_fin, NOW()),
    haac_fecha_modificacion = NOW()
WHERE haac_id = :haacId
  AND haac_estado = 'A'
  AND haac_fecha_eliminacion IS NULL
