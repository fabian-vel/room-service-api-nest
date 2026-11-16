SELECT empl_id,
       empl_usuario,
       empl_nombre,
       empl_rol
FROM tbl_empleados
WHERE empl_estado = 'A'
  AND empl_fecha_eliminacion IS NULL
ORDER BY empl_nombre ASC
