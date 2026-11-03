UPDATE mst_etiquetas
SET etic_llave_mst      = :llaveMst,
    etiq_nombre          = :nombre,
    etiq_descripcion     = :descripcion,
    etiq_fecha_modificacion = NOW()
WHERE etiq_id = :etiqId
  AND etiq_estado = 'A'
  AND etiq_fecha_eliminacion IS NULL
