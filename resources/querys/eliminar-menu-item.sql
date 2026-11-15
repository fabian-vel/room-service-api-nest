UPDATE tbl_menu_items
SET meit_estado            = 'I',
    meit_fecha_eliminacion = NOW()
WHERE meit_id = :meitId
  AND meit_estado = 'A'
  AND meit_fecha_eliminacion IS NULL
