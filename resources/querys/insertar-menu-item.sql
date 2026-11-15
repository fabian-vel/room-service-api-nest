-- la categoría debe ser una subcategoría activa; el padre se toma de ella para que no quede desfasado
INSERT INTO tbl_menu_items (meit_nombre, meit_descripcion, meit_precio, meit_imagen_url, meca_id, meca_parent_id)
SELECT :nombre, :descripcion, :precio, :imagenUrl, MC.meca_id, MC.meca_parent_id
FROM mst_menu_categorias MC
WHERE MC.meca_id = :mecaId
  AND MC.meca_parent_id IS NOT NULL
  AND MC.meca_estado = 'A'
  AND MC.meca_fecha_eliminacion IS NULL
RETURNING meit_id
