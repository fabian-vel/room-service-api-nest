INSERT INTO mst_etiquetas (etic_llave_mst, etiq_nombre, etiq_descripcion)
VALUES (:llaveMst, :nombre, :descripcion)
RETURNING etiq_id
