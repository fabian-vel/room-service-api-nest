-- otro acceso activo de la misma habitación que se cruza con el rango
SELECT EXISTS (SELECT 1
               FROM tbl_habitacion_acceso
               WHERE haac_habitacion = :habitacion
                 AND haac_estado = 'A'
                 AND haac_fecha_eliminacion IS NULL
                 AND haac_fecha_inicio < CAST(:fechaFin AS timestamptz)
                 AND haac_fecha_fin > CAST(:fechaInicio AS timestamptz)
                 AND (CAST(:excluirId AS bigint) IS NULL OR haac_id <> :excluirId)) AS existe
