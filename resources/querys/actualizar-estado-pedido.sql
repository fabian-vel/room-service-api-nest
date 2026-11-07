UPDATE tbl_pedidos
SET pedi_estado_pedido      = :espeId,
    pedi_fecha_modificacion = NOW()
WHERE pedi_id = :pediId
  AND pedi_estado = 'A'
  AND pedi_fecha_eliminacion IS NULL
