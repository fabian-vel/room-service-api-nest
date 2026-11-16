-- el usuario es único también entre los eliminados: si ya existe no inserta y no devuelve fila
INSERT INTO tbl_empleados (empl_usuario, empl_password, empl_nombre, empl_rol)
VALUES (:usuario, :password, :nombre, :rol)
ON CONFLICT (empl_usuario) DO NOTHING
RETURNING empl_id
