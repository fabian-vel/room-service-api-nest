-- todos los ítems activos con su categoría, categoría padre y etiquetas (maestro de ítems)
SELECT MEIT.meit_id,
       MEIT.meit_nombre,
       MEIT.meit_descripcion,
       MEIT.meit_precio,
       MEIT.meit_imagen_url,
       MEIT.meca_id,
       MC.meca_nombre,
       MEIT.meca_parent_id,
       MP.meca_nombre AS meca_parent_nombre,
       JSON_AGG(
               JSON_BUILD_OBJECT('etiqId', ETIQ.etiq_id, 'etiqNombre', ETIQ.etiq_nombre)
               ORDER BY ETIQ.etiq_nombre
       ) FILTER (WHERE ETIQ.etiq_id IS NOT NULL) AS etiquetas
FROM tbl_menu_items MEIT
         INNER JOIN mst_menu_categorias MC
                    ON MC.meca_id = MEIT.meca_id
         LEFT JOIN mst_menu_categorias MP
                   ON MP.meca_id = MEIT.meca_parent_id
         LEFT JOIN tbl_item_etiquetas ITET
                   ON ITET.meit_id = MEIT.meit_id
                       AND ITET.itet_estado = 'A'
         LEFT JOIN mst_etiquetas ETIQ
                   ON ETIQ.etiq_id = ITET.etiq_id
                       AND ETIQ.etiq_estado = 'A'
WHERE MEIT.meit_estado = 'A'
  AND MEIT.meit_fecha_eliminacion IS NULL
GROUP BY MEIT.meit_id,
         MC.meca_nombre,
         MP.meca_nombre
ORDER BY MP.meca_nombre, MC.meca_nombre, MEIT.meit_nombre
