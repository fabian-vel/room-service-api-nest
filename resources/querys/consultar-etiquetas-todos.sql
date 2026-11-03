SELECT etiq_id,
       etic_llave_mst,
       etiq_nombre,
       etiq_descripcion,
       etiq_estado
FROM mst_etiquetas
WHERE etiq_estado = 'A'
  AND etiq_fecha_eliminacion IS NULL
ORDER BY etiq_nombre ASC
