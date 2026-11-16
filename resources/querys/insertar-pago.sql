-- el total sale de los pedidos cobrados, no del cliente; sin empleado activo no inserta
INSERT INTO tbl_pagos (haac_id, empl_id, pago_total, pago_metodo, pago_observacion)
SELECT CAST(:haacId AS bigint),
       M.empl_id,
       (SELECT SUM(P.pedi_total)
        FROM tbl_pedidos P
        WHERE P.pedi_id = ANY (CAST(:pediIds AS bigint[]))),
       CAST(:metodo AS varchar),
       CAST(:observacion AS varchar)
FROM tbl_empleados M
WHERE M.empl_usuario = :usuario
  AND M.empl_estado = 'A'
  AND M.empl_fecha_eliminacion IS NULL
RETURNING pago_id
