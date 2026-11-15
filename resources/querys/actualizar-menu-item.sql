-- la categoría debe ser una subcategoría activa; el padre se toma de ella para que no quede desfasado
UPDATE tbl_menu_items MEIT
SET meit_nombre             = :nombre,
    meit_descripcion        = :descripcion,
    meit_precio             = :precio,
    meit_imagen_url         = :imagenUrl,
    meca_id                 = MC.meca_id,
    meca_parent_id          = MC.meca_parent_id,
    meit_fecha_modificacion = NOW()
FROM mst_menu_categorias MC
WHERE MEIT.meit_id = :meitId
  AND MEIT.meit_estado = 'A'
  AND MEIT.meit_fecha_eliminacion IS NULL
  AND MC.meca_id = :mecaId
  AND MC.meca_parent_id IS NOT NULL
  AND MC.meca_estado = 'A'
  AND MC.meca_fecha_eliminacion IS NULL
