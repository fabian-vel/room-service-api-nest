SELECT empl_id,
       empl_usuario,
       empl_password,
       empl_nombre,
       empl_rol
FROM tbl_empleados
WHERE empl_usuario = :usuario
  AND empl_estado = 'A'
  AND empl_fecha_eliminacion IS NULL