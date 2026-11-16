-- sin contraseña se conserva la actual; quien tiene la sesión no puede quitarse el rol ADMIN
UPDATE tbl_empleados
SET empl_nombre             = :nombre,
    empl_rol                = :rol,
    empl_password           = COALESCE(:password, empl_password),
    empl_fecha_modificacion = NOW()
WHERE empl_id = :emplId
  AND empl_estado = 'A'
  AND empl_fecha_eliminacion IS NULL
  AND (empl_usuario <> :usuarioSesion OR :rol = 'ADMIN')
