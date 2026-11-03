SELECT cons_llave,
       cons_valor
FROM mst_constantes
WHERE cons_llave = ANY(:LLAVES)
  AND cons_estado = 'A'