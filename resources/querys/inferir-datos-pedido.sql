SELECT
    ha.haac_habitacion,
    ha.haac_cliente_nombre,
    mi.meit_id,
    mi.meit_precio,
    (SELECT espe_id FROM mst_estados_pedido WHERE espe_llave_mst = 'ESTA_PEDI_PEND') AS estado_pedido_id
FROM tbl_habitacion_acceso ha
         CROSS JOIN tbl_menu_items mi
WHERE ha.haac_id = :haacId
  AND mi.meit_id = ANY(:meitIds)
  AND mi.meit_estado = 'A'
  AND mi.meit_fecha_eliminacion IS NULL
  AND ha.haac_estado = 'A'
  AND ha.haac_fecha_eliminacion IS NULL