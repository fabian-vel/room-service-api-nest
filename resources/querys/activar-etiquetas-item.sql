-- agrega las etiquetas nuevas y reactiva las que estaban desactivadas (uq_item_etiqueta)
INSERT INTO tbl_item_etiquetas (meit_id, etiq_id)
SELECT :meitId, ETIQ.etiq_id
FROM mst_etiquetas ETIQ
WHERE ETIQ.etiq_id = ANY (CAST(:etiqIds AS smallint[]))
  AND ETIQ.etiq_estado = 'A'
  AND ETIQ.etiq_fecha_eliminacion IS NULL
ON CONFLICT (meit_id, etiq_id) DO UPDATE
    SET itet_estado             = 'A',
        itet_fecha_eliminacion  = NULL,
        itet_fecha_modificacion = NOW()
WHERE tbl_item_etiquetas.itet_estado <> 'A'
