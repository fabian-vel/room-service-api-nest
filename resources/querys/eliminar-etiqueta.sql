UPDATE mst_etiquetas
SET etiq_estado = 'I',
    etiq_fecha_eliminacion = NOW()
WHERE etiq_id = :etiqId
  AND etiq_estado = 'A'
  AND etiq_fecha_eliminacion IS NULL
