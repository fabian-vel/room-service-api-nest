UPDATE tbl_habitacion_acceso
SET haac_codigo             = :codigo,
    haac_fecha_modificacion = NOW()
WHERE haac_id = :haacId
  AND haac_estado = 'A'
  AND haac_fecha_eliminacion IS NULL
