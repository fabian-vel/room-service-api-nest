-- la habitación no cambia; un acceso finalizado ya no se edita
UPDATE tbl_habitacion_acceso
SET haac_cliente_nombre     = :clienteNombre,
    haac_cliente_doc        = :clienteDoc,
    haac_fecha_inicio       = :fechaInicio,
    haac_fecha_fin          = :fechaFin,
    haac_fecha_modificacion = NOW()
WHERE haac_id = :haacId
  AND haac_estado = 'A'
  AND haac_fecha_eliminacion IS NULL
