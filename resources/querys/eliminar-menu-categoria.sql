UPDATE mst_menu_categorias
SET meca_estado = 'I',
    meca_fecha_eliminacion = NOW()
WHERE meca_id = :mecaId
  AND meca_estado = 'A'
  AND meca_fecha_eliminacion IS NULL
