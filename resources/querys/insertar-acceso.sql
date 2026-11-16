INSERT INTO tbl_habitacion_acceso (haac_habitacion, haac_codigo, haac_cliente_nombre, haac_cliente_doc,
                                   haac_fecha_inicio, haac_fecha_fin)
VALUES (:habitacion, :codigo, :clienteNombre, :clienteDoc, :fechaInicio, :fechaFin)
RETURNING haac_id
