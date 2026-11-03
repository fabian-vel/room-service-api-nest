SELECT cons_id,
       cons_llave,
       cons_valor,
       cons_descripcion,
       cons_estado
FROM mst_constantes
WHERE cons_estado = 'A'
  AND cons_fecha_eliminacion IS NULL
ORDER BY cons_llave ASC
