UPDATE tbl_pedidos
SET pago_id                 = :pagoId,
    pedi_fecha_modificacion = NOW()
WHERE pedi_id = ANY (CAST(:pediIds AS bigint[]))
