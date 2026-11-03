SELECT
    mi.meit_id,
    mi.meit_nombre,
    mi.meit_imagen_url,
    mi.meit_precio
FROM tbl_menu_items mi
WHERE mi.meit_estado = 'A'
  AND mi.meit_fecha_eliminacion IS NULL
ORDER BY mi.meit_fecha_creacion DESC
    LIMIT :CANTIDAD