SELECT meca_id,
       meca_llave_mst,
       meca_nombre,
       meca_descripcion,
       meca_imagen_url,
       meca_parent_id,
       meca_estado
FROM mst_menu_categorias
WHERE meca_estado = 'A'
  AND meca_fecha_eliminacion IS NULL
ORDER BY meca_nombre ASC
