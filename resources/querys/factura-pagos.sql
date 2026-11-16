SELECT G.pago_id,
       G.pago_total,
       G.pago_metodo,
       G.pago_observacion,
       G.pago_fecha_creacion,
       M.empl_nombre
FROM tbl_pagos G
         INNER JOIN tbl_empleados M
                    ON M.empl_id = G.empl_id
WHERE G.haac_id = :haacId
  AND G.pago_estado = 'A'
  AND G.pago_fecha_eliminacion IS NULL
ORDER BY G.pago_fecha_creacion ASC
