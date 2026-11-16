-- el código es único en toda la tabla, también entre accesos viejos
SELECT NOT EXISTS (SELECT 1
                   FROM tbl_habitacion_acceso
                   WHERE haac_codigo = :codigo) AS disponible
