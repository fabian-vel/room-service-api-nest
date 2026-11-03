UPDATE mst_constantes
SET cons_estado = 'I',
    cons_fecha_eliminacion = NOW()
WHERE cons_id = :consId
  AND cons_estado = 'A'
  AND cons_fecha_eliminacion IS NULL
