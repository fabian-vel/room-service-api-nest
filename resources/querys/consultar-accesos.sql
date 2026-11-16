-- con habitación: su historial; sin habitación: los accesos activos que no han vencido
SELECT haac_id,
       haac_habitacion,
       haac_codigo,
       haac_cliente_nombre,
       haac_cliente_doc,
       haac_fecha_inicio,
       haac_fecha_fin,
       haac_estado
FROM tbl_habitacion_acceso
WHERE haac_fecha_eliminacion IS NULL
  AND ((CAST(:habitacion AS varchar) IS NOT NULL AND haac_habitacion = :habitacion)
    OR (CAST(:habitacion AS varchar) IS NULL AND haac_estado = 'A' AND haac_fecha_fin >= NOW()))
ORDER BY haac_fecha_inicio DESC
LIMIT 100
