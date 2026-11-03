UPDATE mst_constantes
SET cons_llave              = :llave,
    cons_valor              = :valor,
    cons_descripcion        = :descripcion,
    cons_fecha_modificacion = NOW()
WHERE cons_id = :consId
  AND cons_estado = 'A'
  AND cons_fecha_eliminacion IS NULL
