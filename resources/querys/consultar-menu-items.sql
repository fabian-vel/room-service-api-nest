SELECT MEIT.meit_id,
       MEIT.meit_nombre,
       MEIT.meit_descripcion,
       MEIT.meit_precio,
       MEIT.meit_imagen_url,
       MEIT.meca_id,
       MEIT.meca_parent_id,
       JSON_AGG(
               JSON_BUILD_OBJECT(
                       'etiqId', ETIQ.etiq_id,
                       'etiqNombre', ETIQ.etiq_nombre,
                       'etiqDescripcion', ETIQ.etiq_descripcion
               )
       ) FILTER (WHERE ETIQ.etiq_id IS NOT NULL) AS etiquetas
FROM TBL_MENU_ITEMS MEIT
         LEFT JOIN TBL_ITEM_ETIQUETAS ITET
                   ON MEIT.meit_id = ITET.meit_id
                       AND ITET.itet_estado = 'A'
         LEFT JOIN MST_ETIQUETAS ETIQ
                   ON ITET.etiq_id = ETIQ.etiq_id
                       AND ETIQ.etiq_estado = 'A'
WHERE MEIT.meca_id = :MECA_ID
  AND MEIT.meit_estado = 'A'
  AND MEIT.meit_fecha_eliminacion IS NULL
GROUP BY MEIT.meit_id,
         MEIT.meit_nombre,
         MEIT.meit_descripcion,
         MEIT.meit_precio,
         MEIT.meit_imagen_url,
         MEIT.meca_id,
         MEIT.meca_parent_id
ORDER BY MEIT.meit_id