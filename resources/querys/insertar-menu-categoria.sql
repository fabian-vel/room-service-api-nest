INSERT INTO mst_menu_categorias (meca_llave_mst, meca_nombre, meca_descripcion, meca_imagen_url, meca_parent_id)
VALUES (:llaveMst, :nombre, :descripcion, :imagenUrl, :parentId)
RETURNING meca_id
