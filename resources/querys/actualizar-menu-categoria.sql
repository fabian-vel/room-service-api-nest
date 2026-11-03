UPDATE mst_menu_categorias
SET meca_llave_mst          = :llaveMst,
    meca_nombre             = :nombre,
    meca_descripcion        = :descripcion,
    meca_imagen_url         = :imagenUrl,
    meca_parent_id          = :parentId,
    meca_fecha_modificacion = NOW()
WHERE meca_id = :mecaId
  AND meca_estado = 'A'
  AND meca_fecha_eliminacion IS NULL
