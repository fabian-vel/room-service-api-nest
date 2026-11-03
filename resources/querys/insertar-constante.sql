INSERT INTO mst_constantes (cons_llave, cons_valor, cons_descripcion)
VALUES (:llave, :valor, :descripcion)
RETURNING cons_id
