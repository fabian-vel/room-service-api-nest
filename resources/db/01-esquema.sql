-- Esquema de la base de datos hotelguestdb (PostgreSQL 18).
-- Generado con pg_dump --schema-only a partir de la BD de desarrollo.
-- Orden de ejecución: 01-esquema.sql y luego 02-datos-base.sql, sobre una BD vacía.

CREATE TABLE public.mst_constantes (
    cons_id smallint NOT NULL,
    cons_llave character varying(100) NOT NULL,
    cons_valor character varying(100) NOT NULL,
    cons_descripcion character varying(255),
    cons_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    cons_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    cons_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    cons_fecha_eliminacion timestamp with time zone
);

CREATE SEQUENCE public.mst_constantes_cons_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.mst_constantes_cons_id_seq OWNED BY public.mst_constantes.cons_id;

CREATE TABLE public.mst_estados_pedido (
    espe_id smallint NOT NULL,
    espe_llave_mst character varying(50) NOT NULL,
    espe_nombre character varying(50) NOT NULL,
    espe_descripcion character varying(255),
    espe_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    espe_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    espe_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    espe_fecha_eliminacion timestamp with time zone
);

CREATE SEQUENCE public.mst_estados_pedido_espe_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.mst_estados_pedido_espe_id_seq OWNED BY public.mst_estados_pedido.espe_id;

CREATE TABLE public.mst_etiquetas (
    etiq_id smallint NOT NULL,
    etic_llave_mst character varying(50) NOT NULL,
    etiq_nombre character varying(100) NOT NULL,
    etiq_descripcion character varying(255),
    etiq_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    etiq_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    etiq_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    etiq_fecha_eliminacion timestamp with time zone
);

ALTER TABLE public.mst_etiquetas ALTER COLUMN etiq_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mst_etiquetas_etiq_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.mst_menu_categorias (
    meca_id smallint NOT NULL,
    meca_llave_mst character varying(50) NOT NULL,
    meca_nombre character varying(100) NOT NULL,
    meca_descripcion character varying(255),
    meca_imagen_url character varying(500),
    meca_parent_id smallint,
    meca_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    meca_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    meca_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    meca_fecha_eliminacion timestamp with time zone
);

ALTER TABLE public.mst_menu_categorias ALTER COLUMN meca_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mst_menu_categorias_meca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.tbl_empleados (
    empl_id smallint NOT NULL,
    empl_usuario character varying(50) NOT NULL,
    empl_password character varying(255) NOT NULL,
    empl_nombre character varying(100) NOT NULL,
    empl_rol character varying(20) NOT NULL,
    empl_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    empl_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    empl_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    empl_fecha_eliminacion timestamp with time zone
);

CREATE SEQUENCE public.tbl_empleados_empl_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.tbl_empleados_empl_id_seq OWNED BY public.tbl_empleados.empl_id;

CREATE TABLE public.tbl_habitacion_acceso (
    haac_id bigint NOT NULL,
    haac_habitacion character varying(10) NOT NULL,
    haac_codigo character varying(10) NOT NULL,
    haac_fecha_inicio timestamp with time zone NOT NULL,
    haac_fecha_fin timestamp with time zone NOT NULL,
    haac_estado character varying(1) DEFAULT 'A'::character varying,
    haac_cliente_nombre character varying(100) NOT NULL,
    haac_cliente_doc character varying(20),
    haac_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    haac_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    haac_fecha_eliminacion timestamp with time zone
);

CREATE SEQUENCE public.tbl_habitacion_acceso_haac_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.tbl_habitacion_acceso_haac_id_seq OWNED BY public.tbl_habitacion_acceso.haac_id;

CREATE TABLE public.tbl_item_etiquetas (
    meit_id smallint NOT NULL,
    etiq_id smallint NOT NULL,
    itet_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    itet_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    itet_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    itet_fecha_eliminacion timestamp with time zone,
    itet_id smallint NOT NULL
);

ALTER TABLE public.tbl_item_etiquetas ALTER COLUMN itet_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_item_etiquetas_itet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.tbl_menu_items (
    meit_id smallint NOT NULL,
    meit_nombre character varying(100) NOT NULL,
    meit_descripcion text,
    meit_precio numeric(10,2) NOT NULL,
    meit_imagen_url character varying(500),
    meca_id smallint NOT NULL,
    meca_parent_id smallint CONSTRAINT tbl_menu_items_suca_id_not_null NOT NULL,
    meit_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    meit_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    meit_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    meit_fecha_eliminacion timestamp with time zone
);

ALTER TABLE public.tbl_menu_items ALTER COLUMN meit_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tbl_menu_items_meit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.tbl_pagos (
    pago_id bigint NOT NULL,
    haac_id bigint NOT NULL,
    empl_id smallint NOT NULL,
    pago_total numeric(10,2) NOT NULL,
    pago_metodo character varying(20) NOT NULL,
    pago_observacion character varying(255),
    pago_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    pago_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    pago_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    pago_fecha_eliminacion timestamp with time zone
);

CREATE SEQUENCE public.tbl_pagos_pago_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.tbl_pagos_pago_id_seq OWNED BY public.tbl_pagos.pago_id;

CREATE TABLE public.tbl_pedido_detalle (
    pede_id bigint NOT NULL,
    pedi_id bigint NOT NULL,
    meit_id smallint NOT NULL,
    pede_cantidad smallint NOT NULL,
    pede_precio_unitario numeric(10,2) NOT NULL,
    pede_subtotal numeric(10,2) NOT NULL,
    pede_observacion character varying(255),
    pede_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    pede_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    pede_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    pede_fecha_eliminacion timestamp with time zone
);

CREATE SEQUENCE public.tbl_pedido_detalle_pede_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.tbl_pedido_detalle_pede_id_seq OWNED BY public.tbl_pedido_detalle.pede_id;

CREATE TABLE public.tbl_pedidos (
    pedi_id bigint NOT NULL,
    haac_id bigint NOT NULL,
    pedi_habitacion character varying(10) NOT NULL,
    pedi_cliente_nombre character varying(100) NOT NULL,
    pedi_estado_pedido smallint NOT NULL,
    pedi_observacion character varying(500),
    pedi_total numeric(10,2) NOT NULL,
    pedi_estado character varying(1) DEFAULT 'A'::character varying NOT NULL,
    pedi_fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    pedi_fecha_modificacion timestamp with time zone DEFAULT now() NOT NULL,
    pedi_fecha_eliminacion timestamp with time zone,
    pago_id bigint
);

CREATE SEQUENCE public.tbl_pedidos_pedi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.tbl_pedidos_pedi_id_seq OWNED BY public.tbl_pedidos.pedi_id;

ALTER TABLE ONLY public.mst_constantes ALTER COLUMN cons_id SET DEFAULT nextval('public.mst_constantes_cons_id_seq'::regclass);

ALTER TABLE ONLY public.mst_estados_pedido ALTER COLUMN espe_id SET DEFAULT nextval('public.mst_estados_pedido_espe_id_seq'::regclass);

ALTER TABLE ONLY public.tbl_empleados ALTER COLUMN empl_id SET DEFAULT nextval('public.tbl_empleados_empl_id_seq'::regclass);

ALTER TABLE ONLY public.tbl_habitacion_acceso ALTER COLUMN haac_id SET DEFAULT nextval('public.tbl_habitacion_acceso_haac_id_seq'::regclass);

ALTER TABLE ONLY public.tbl_pedido_detalle ALTER COLUMN pede_id SET DEFAULT nextval('public.tbl_pedido_detalle_pede_id_seq'::regclass);

ALTER TABLE ONLY public.tbl_pagos ALTER COLUMN pago_id SET DEFAULT nextval('public.tbl_pagos_pago_id_seq'::regclass);

ALTER TABLE ONLY public.tbl_pedidos ALTER COLUMN pedi_id SET DEFAULT nextval('public.tbl_pedidos_pedi_id_seq'::regclass);

ALTER TABLE ONLY public.mst_constantes
    ADD CONSTRAINT mst_constantes_cons_llave_key UNIQUE (cons_llave);

ALTER TABLE ONLY public.mst_constantes
    ADD CONSTRAINT mst_constantes_pkey PRIMARY KEY (cons_id);

ALTER TABLE ONLY public.mst_estados_pedido
    ADD CONSTRAINT mst_estados_pedido_espe_llave_mst_key UNIQUE (espe_llave_mst);

ALTER TABLE ONLY public.mst_estados_pedido
    ADD CONSTRAINT mst_estados_pedido_pkey PRIMARY KEY (espe_id);

ALTER TABLE ONLY public.mst_etiquetas
    ADD CONSTRAINT mst_etiquetas_etic_llave_mst_key UNIQUE (etic_llave_mst);

ALTER TABLE ONLY public.mst_etiquetas
    ADD CONSTRAINT mst_etiquetas_pkey PRIMARY KEY (etiq_id);

ALTER TABLE ONLY public.mst_menu_categorias
    ADD CONSTRAINT mst_menu_categorias_meca_llave_mst_key UNIQUE (meca_llave_mst);

ALTER TABLE ONLY public.mst_menu_categorias
    ADD CONSTRAINT mst_menu_categorias_pkey PRIMARY KEY (meca_id);

ALTER TABLE ONLY public.tbl_empleados
    ADD CONSTRAINT tbl_empleados_empl_usuario_key UNIQUE (empl_usuario);

ALTER TABLE ONLY public.tbl_empleados
    ADD CONSTRAINT tbl_empleados_pkey PRIMARY KEY (empl_id);

ALTER TABLE ONLY public.tbl_habitacion_acceso
    ADD CONSTRAINT tbl_habitacion_acceso_haac_codigo_key UNIQUE (haac_codigo);

ALTER TABLE ONLY public.tbl_habitacion_acceso
    ADD CONSTRAINT tbl_habitacion_acceso_pkey PRIMARY KEY (haac_id);

ALTER TABLE ONLY public.tbl_item_etiquetas
    ADD CONSTRAINT tbl_item_etiquetas_pkey PRIMARY KEY (itet_id);

ALTER TABLE ONLY public.tbl_menu_items
    ADD CONSTRAINT tbl_menu_items_pkey PRIMARY KEY (meit_id);

ALTER TABLE ONLY public.tbl_pedido_detalle
    ADD CONSTRAINT tbl_pedido_detalle_pkey PRIMARY KEY (pede_id);

ALTER TABLE ONLY public.tbl_pagos
    ADD CONSTRAINT tbl_pagos_pkey PRIMARY KEY (pago_id);

ALTER TABLE ONLY public.tbl_pedidos
    ADD CONSTRAINT tbl_pedidos_pkey PRIMARY KEY (pedi_id);

ALTER TABLE ONLY public.tbl_item_etiquetas
    ADD CONSTRAINT uq_item_etiqueta UNIQUE (meit_id, etiq_id);

CREATE INDEX idx_pedido_detalle_pedi_id ON public.tbl_pedido_detalle USING btree (pedi_id);

CREATE INDEX idx_pagos_haac_id ON public.tbl_pagos USING btree (haac_id);

CREATE INDEX idx_pedidos_fecha_creacion ON public.tbl_pedidos USING btree (pedi_fecha_creacion);

CREATE INDEX idx_pedidos_haac_id ON public.tbl_pedidos USING btree (haac_id);

ALTER TABLE ONLY public.mst_menu_categorias
    ADD CONSTRAINT mst_menu_categorias_meca_parent_id_fkey FOREIGN KEY (meca_parent_id) REFERENCES public.mst_menu_categorias(meca_id);

ALTER TABLE ONLY public.tbl_item_etiquetas
    ADD CONSTRAINT tbl_item_etiquetas_etiq_id_fkey FOREIGN KEY (etiq_id) REFERENCES public.mst_etiquetas(etiq_id);

ALTER TABLE ONLY public.tbl_item_etiquetas
    ADD CONSTRAINT tbl_item_etiquetas_meit_id_fkey FOREIGN KEY (meit_id) REFERENCES public.tbl_menu_items(meit_id);

ALTER TABLE ONLY public.tbl_menu_items
    ADD CONSTRAINT tbl_menu_items_meca_id_fkey FOREIGN KEY (meca_id) REFERENCES public.mst_menu_categorias(meca_id);

ALTER TABLE ONLY public.tbl_menu_items
    ADD CONSTRAINT tbl_menu_items_suca_id_fkey FOREIGN KEY (meca_parent_id) REFERENCES public.mst_menu_categorias(meca_id);

ALTER TABLE ONLY public.tbl_pedido_detalle
    ADD CONSTRAINT tbl_pedido_detalle_meit_id_fkey FOREIGN KEY (meit_id) REFERENCES public.tbl_menu_items(meit_id);

ALTER TABLE ONLY public.tbl_pedido_detalle
    ADD CONSTRAINT tbl_pedido_detalle_pedi_id_fkey FOREIGN KEY (pedi_id) REFERENCES public.tbl_pedidos(pedi_id);

ALTER TABLE ONLY public.tbl_pedidos
    ADD CONSTRAINT tbl_pedidos_haac_id_fkey FOREIGN KEY (haac_id) REFERENCES public.tbl_habitacion_acceso(haac_id);

ALTER TABLE ONLY public.tbl_pagos
    ADD CONSTRAINT tbl_pagos_empl_id_fkey FOREIGN KEY (empl_id) REFERENCES public.tbl_empleados(empl_id);

ALTER TABLE ONLY public.tbl_pagos
    ADD CONSTRAINT tbl_pagos_haac_id_fkey FOREIGN KEY (haac_id) REFERENCES public.tbl_habitacion_acceso(haac_id);

ALTER TABLE ONLY public.tbl_pedidos
    ADD CONSTRAINT tbl_pedidos_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES public.tbl_pagos(pago_id);

ALTER TABLE ONLY public.tbl_pedidos
    ADD CONSTRAINT tbl_pedidos_pedi_estado_pedido_fkey FOREIGN KEY (pedi_estado_pedido) REFERENCES public.mst_estados_pedido(espe_id);

