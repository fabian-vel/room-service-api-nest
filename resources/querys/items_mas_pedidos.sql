SELECT mi.meit_id,
       mi.meit_nombre,
       mi.meit_imagen_url,
       mi.meit_precio,
       COUNT(pede.meit_id)        AS total,
       MAX(p.pedi_fecha_creacion) AS ultima_fecha
FROM tbl_pedido_detalle pede
         INNER JOIN tbl_pedidos p
                    ON p.pedi_id = pede.pedi_id
         INNER JOIN tbl_menu_items mi
                    ON mi.meit_id = pede.meit_id
WHERE pede.pede_estado = 'A'
  AND pede.pede_fecha_eliminacion IS NULL
  AND p.pedi_estado = 'A'
  AND p.pedi_fecha_eliminacion IS NULL
  AND mi.meit_estado = 'A'
  AND mi.meit_fecha_eliminacion IS NULL
  AND pede.pede_estado = 'A'
GROUP BY mi.meit_id,
         mi.meit_nombre,
         mi.meit_imagen_url,
         mi.meit_precio
ORDER BY total DESC, ultima_fecha DESC
    LIMIT :CANTIDAD