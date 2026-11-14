-- Datos base que el sistema necesita para funcionar. Se ejecuta después de 01-esquema.sql.
-- Los ids se fijan porque las constantes y el código los referencian
-- (estados 1-4, categorías raíz 1 Platos y 2 Bebidas, etiqueta 11 del chef).

BEGIN;

-- Estados de pedido: el código usa las llaves y los ids (1 pendiente, 2 en preparación, 3 entregado, 4 cancelado)
INSERT INTO public.mst_estados_pedido (espe_id, espe_llave_mst, espe_nombre, espe_descripcion) VALUES
    (1, 'ESTA_PEDI_PEND', 'Pendiente', 'Pedido recibido, en espera de preparación'),
    (2, 'ESTA_PEDI_PREP', 'En preparación', 'Pedido siendo preparado en cocina'),
    (3, 'ESTA_PEDI_ENTR', 'Entregado', 'Pedido entregado en la habitación'),
    (4, 'ESTA_PEDI_CANC', 'Cancelado', 'Pedido cancelado');
SELECT setval('public.mst_estados_pedido_espe_id_seq', (SELECT max(espe_id) FROM public.mst_estados_pedido));

-- Etiquetas: la 11 es la que usa CONST_ETIQ_RECOM_CHEF
INSERT INTO public.mst_etiquetas (etiq_id, etic_llave_mst, etiq_nombre) OVERRIDING SYSTEM VALUE VALUES
    (1, 'ETIQ_MST_PICANTE', 'Picante'),
    (2, 'ETIQ_MST_VEGETARIANO', 'Vegetariano'),
    (3, 'ETIQ_MST_VEGANO', 'Vegano'),
    (4, 'ETIQ_MST_SIN_GLUTEN', 'Sin Gluten'),
    (5, 'ETIQ_MST_POPULAR', 'Popular'),
    (6, 'ETIQ_MST_NUEVO', 'Nuevo'),
    (7, 'ETIQ_MST_RECOMENDADO', 'Recomendado'),
    (8, 'ETIQ_MST_LIGERO', 'Ligero'),
    (9, 'ETIQ_MST_SIN_ALCOHOL', 'Sin Alcohol'),
    (10, 'ETIQ_MST_ARTESANAL', 'Artesanal'),
    (11, 'ETIQ_MST_RECO_CHEF', 'Recomendado del chef');
SELECT setval('public.mst_etiquetas_etiq_id_seq', (SELECT max(etiq_id) FROM public.mst_etiquetas));

-- Categorías del menú: las raíz 1 y 2 las usan CONST_CATE_PLATO / CONST_CATE_BEBIDA y la app
INSERT INTO public.mst_menu_categorias (meca_id, meca_llave_mst, meca_nombre, meca_parent_id) OVERRIDING SYSTEM VALUE VALUES
    (1, 'MECA_LLAV_MST_PLAT', 'Platos', NULL),
    (2, 'MECA_LLAV_MST_BEBI', 'Bebidas', NULL),
    (3, 'MECA_LLAV_MST_ENTR', 'Entradas', 1),
    (4, 'MECA_LLAV_MST_PL_FU', 'Platos fuertes', 1),
    (5, 'MECA_LLAV_MST_POST', 'Postres', 1),
    (6, 'MECA_LLAV_MST_JUGO', 'Jugos', 2),
    (7, 'MECA_LLAV_MST_CERV', 'Cervezas', 2),
    (8, 'MECA_LLAV_MST_COCT', 'Cócteles', 2),
    (9, 'MECA_LLAV_MST_GASE', 'Gaseosas', 2);
SELECT setval('public.mst_menu_categorias_meca_id_seq', (SELECT max(meca_id) FROM public.mst_menu_categorias));

-- Constantes
INSERT INTO public.mst_constantes (cons_llave, cons_valor, cons_descripcion) VALUES
    ('CONST_CATE_PLATO', '1', 'CATEGORIA PLATOS - MST-MENU-CATEGORIAS'),
    ('CONST_CATE_BEBIDA', '2', 'CATEGORIA BEBIDAS - MST-MENU-CATEGORIAS'),
    ('CONST_ESTA_PENDT', '1', 'ESTADO PEDIDO PENDIENTE - MST-ESTADO-PEDIDO'),
    ('CONST_ESTA_PREPAR', '2', 'ESTADO PEDIDO EN PREPARACION - MST-ESTADO-PEDIDO'),
    ('CONST_ESTA_ENTREG', '3', 'ESTADO PEDIDO ENTREGADO - MST-ESTADO-PEDIDO'),
    ('CONST_ESTA_CANCEL', '4', 'ESTADO PEDIDO CANCELADO - MST-ESTADO-PEDIDO'),
    ('CONST_ID_ETIQ_TODOS', '0', 'ID ETIQUETA TODOS - CONSTANTE'),
    ('CONST_NOMBRE_ETIQ_TODOS', 'Todos', 'NOMBRE ETIQUETA TODOS - CONSTANTE'),
    ('CONST_ETIQ_RECOM_CHEF', '11', 'ID ETIQUETA RECOMENDADO POR CHEF - MST_ETIQUETAS');

-- Empleado inicial: no se versiona la contraseña. Generar el hash y descomentar:
--   node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" "<contraseña>"
-- INSERT INTO public.tbl_empleados (empl_usuario, empl_password, empl_nombre, empl_rol)
--     VALUES ('admin', '<hash>', 'Administrador', 'ADMIN');

COMMIT;
