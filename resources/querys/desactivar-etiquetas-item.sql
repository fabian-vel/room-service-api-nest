-- desactiva las etiquetas del ítem que ya no vienen en la lista
UPDATE tbl_item_etiquetas
SET itet_estado             = 'I',
    itet_fecha_eliminacion  = NOW(),
    itet_fecha_modificacion = NOW()
WHERE meit_id = :meitId
  AND itet_estado = 'A'
  AND NOT (etiq_id = ANY (CAST(:etiqIds AS smallint[])))
