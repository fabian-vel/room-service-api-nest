SELECT DISTINCT
    ETIQ.etiq_id,
    ETIQ.etiq_nombre,
    ETIQ.etiq_descripcion
FROM mst_etiquetas ETIQ
         INNER JOIN tbl_item_etiquetas ITET
                    ON ETIQ.etiq_id = ITET.etiq_id
         INNER JOIN tbl_menu_items MEIT
                    ON ITET.meit_id = MEIT.meit_id
WHERE ETIQ.etiq_estado = 'A'
  AND ITET.itet_estado = 'A'
  AND MEIT.meit_estado = 'A'
  AND MEIT.meca_id = :MECA_ID
ORDER BY ETIQ.etiq_nombre
