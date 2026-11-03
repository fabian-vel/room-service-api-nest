SELECT
    mi.meit_id,
    mi.meit_nombre,
    mi.meit_imagen_url,
    mi.meit_precio
FROM tbl_menu_items mi
         INNER JOIN tbl_item_etiquetas itet
                    ON mi.meit_id = itet.meit_id
WHERE mi.meit_estado = 'A'
  AND itet.etiq_id = :ETIQUETA
  AND itet.itet_estado = 'A'
ORDER BY itet.itet_fecha_creacion DESC
    LIMIT :CANTIDAD