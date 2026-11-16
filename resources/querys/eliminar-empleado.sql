-- quien tiene la sesión no puede eliminarse a sí mismo
UPDATE tbl_empleados
SET empl_estado = 'I',
    empl_fecha_eliminacion = NOW()
WHERE empl_id = :emplId
  AND empl_estado = 'A'
  AND empl_fecha_eliminacion IS NULL
  AND empl_usuario <> :usuarioSesion
