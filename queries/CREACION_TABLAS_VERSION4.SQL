-- ===========================================================================
-- SCRIPT DDL FINAL: SECGUARD LOGISTICS (RANSA)
-- AUTOR: DIOGO ABREGU
-- DESCRIPCIÓN: Creación limpia de todas las tablas con las modificaciones
--              acordadas ya integradas. Incluye DROP CASCADE y reset de
--              secuencias para ejecución idempotente.
-- VERSION: 3.0
-- ===========================================================================


-- ===========================================================================
-- SECCIÓN 1: LIMPIEZA — DROP TABLES (orden inverso por dependencias FK)
-- ===========================================================================

DROP TABLE IF EXISTS motivo_acceso                   CASCADE;
DROP TABLE IF EXISTS intento_acceso_no_registrado    CASCADE;
DROP TABLE IF EXISTS snapshot_kpi_diario             CASCADE;
DROP TABLE IF EXISTS metrica_operacional_sistema     CASCADE;
DROP TABLE IF EXISTS mantenimiento_camion              CASCADE;
DROP TABLE IF EXISTS viaje_camion_asignado             CASCADE;
DROP TABLE IF EXISTS auditoria_modificacion_acceso     CASCADE;
DROP TABLE IF EXISTS configuracion_kpi                 CASCADE;
DROP TABLE IF EXISTS infraccion_transito               CASCADE;
DROP TABLE IF EXISTS anomalia_acceso                   CASCADE;
DROP TABLE IF EXISTS registro_acceso                   CASCADE;
DROP TABLE IF EXISTS camara_dispositivo                CASCADE;
DROP TABLE IF EXISTS viaje_programado                  CASCADE;
DROP TABLE IF EXISTS detalle_pedido_mercancia          CASCADE;
DROP TABLE IF EXISTS pedido_cliente                    CASCADE;
DROP TABLE IF EXISTS restriccion_horaria_cliente       CASCADE;  -- por si existe de versiones anteriores
DROP TABLE IF EXISTS camion_ransa                      CASCADE;
DROP TABLE IF EXISTS conductor_ransa                   CASCADE;
DROP TABLE IF EXISTS cliente_empresa                   CASCADE;
DROP TABLE IF EXISTS sesion_admin                      CASCADE;
DROP TABLE IF EXISTS administrador                     CASCADE;


-- ===========================================================================
-- SECCIÓN 2: RESET DE SECUENCIAS
-- ===========================================================================

DROP SEQUENCE IF EXISTS motivo_acceso_id_motivo_seq                       CASCADE;
DROP SEQUENCE IF EXISTS intento_acceso_no_registrado_id_intento_seq       CASCADE;
DROP SEQUENCE IF EXISTS snapshot_kpi_diario_id_snapshot_seq               CASCADE;
DROP SEQUENCE IF EXISTS metrica_operacional_sistema_id_metrica_seq        CASCADE;
DROP SEQUENCE IF EXISTS administrador_id_admin_seq                CASCADE;
DROP SEQUENCE IF EXISTS sesion_admin_id_sesion_seq                CASCADE;
DROP SEQUENCE IF EXISTS cliente_empresa_id_cliente_seq            CASCADE;
DROP SEQUENCE IF EXISTS conductor_ransa_id_conductor_seq          CASCADE;
DROP SEQUENCE IF EXISTS camion_ransa_id_camion_seq                CASCADE;
DROP SEQUENCE IF EXISTS pedido_cliente_id_pedido_seq              CASCADE;
DROP SEQUENCE IF EXISTS detalle_pedido_mercancia_id_detalle_seq   CASCADE;
DROP SEQUENCE IF EXISTS viaje_programado_id_viaje_seq             CASCADE;
DROP SEQUENCE IF EXISTS viaje_camion_asignado_id_asignacion_seq   CASCADE;
DROP SEQUENCE IF EXISTS camara_dispositivo_id_camara_seq          CASCADE;
DROP SEQUENCE IF EXISTS registro_acceso_id_acceso_seq             CASCADE;
DROP SEQUENCE IF EXISTS anomalia_acceso_id_anomalia_seq           CASCADE;
DROP SEQUENCE IF EXISTS infraccion_transito_id_infraccion_seq     CASCADE;
DROP SEQUENCE IF EXISTS auditoria_modificacion_acceso_id_auditoria_seq CASCADE;
DROP SEQUENCE IF EXISTS configuracion_kpi_id_kpi_seq              CASCADE;
DROP SEQUENCE IF EXISTS mantenimiento_camion_id_mantenimiento_seq CASCADE;


-- ===========================================================================
-- SECCIÓN 3: CREACIÓN DE TABLAS
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- MÓDULO 1: SEGURIDAD Y AUTENTICACIÓN
-- ---------------------------------------------------------------------------

CREATE TABLE administrador (
    id_admin             SERIAL PRIMARY KEY,
    nombres              VARCHAR(100) NOT NULL,
    apellidos            VARCHAR(100) NOT NULL,
    correo_electronico   VARCHAR(150) NOT NULL UNIQUE,
    nombre_usuario       VARCHAR(50)  NOT NULL UNIQUE,
    contrasenia_hash     VARCHAR(255) NOT NULL,
    estado_cuenta        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',
    creado_en            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sesion_admin (
    id_sesion            SERIAL PRIMARY KEY,
    id_admin             INT          NOT NULL,
    token_autenticacion  TEXT         NOT NULL,
    ip_origen            VARCHAR(45)  NOT NULL,
    ingresado_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiracion_en        TIMESTAMP    NOT NULL,
    CONSTRAINT fk_sesion_admin FOREIGN KEY (id_admin)
        REFERENCES administrador(id_admin) ON DELETE CASCADE
);


-- ---------------------------------------------------------------------------
-- MÓDULO 2: CLIENTES Y FLOTA PROPIA RANSA
-- ---------------------------------------------------------------------------

CREATE TABLE cliente_empresa (
    id_cliente           SERIAL PRIMARY KEY,
    ruc                  VARCHAR(11)  NOT NULL UNIQUE,
    razon_social         VARCHAR(150) NOT NULL,
    sector_industrial    VARCHAR(50)  NOT NULL,
    estado_cuenta        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO'
);

CREATE TABLE conductor_ransa (
    id_conductor              SERIAL PRIMARY KEY,
    dni                       VARCHAR(8)   NOT NULL UNIQUE,
    nombres                   VARCHAR(100) NOT NULL,
    apellidos                 VARCHAR(100) NOT NULL,
    nro_brevete               VARCHAR(15)  NOT NULL UNIQUE,
    vigencia_sctr             DATE         NOT NULL,
    charla_induccion_aprobada BOOLEAN      NOT NULL DEFAULT FALSE,
    empresa_transportista     VARCHAR(150),
    estado_empleado           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO'
    -- estado_empleado: ACTIVO, EN_RUTA, DESCANSO, INACTIVO
    -- La disponibilidad se infiere desde este campo, sin columna extra
);

CREATE TABLE camion_ransa (
    id_camion                   SERIAL PRIMARY KEY,
    placa_matricula             VARCHAR(15)   NOT NULL UNIQUE,
    modelo                      VARCHAR(50)   NOT NULL,
    capacidad_toneladas         DECIMAL(5,2)  NOT NULL,
    tipo_unidad                 VARCHAR(30)   NOT NULL,   -- TRACTO_CAMION, CAMION_RIGIDO, FURGON
    vigencia_soat               DATE          NOT NULL,
    vigencia_tarjeta_propiedad  DATE          NOT NULL,
    observaciones      TEXT,
    estado_operativo            VARCHAR(24)   NOT NULL DEFAULT 'DISPONIBLE',
    -- MODIFICACIÓN v2.0: columnas agregadas para pantalla Gestión de Flota
    url_foto_vehiculo           VARCHAR(255),
    clasificacion_peso          VARCHAR(30)   CHECK (clasificacion_peso IN (
                                    'CARGA_PESADA', 'CARGA_MEDIA', 'COMERCIAL_LIGERO'
                                )),
    fecha_proximo_mantenimiento DATE
);


-- ---------------------------------------------------------------------------
-- MÓDULO 2 (NUEVO v2.0): HISTORIAL DE MANTENIMIENTO DE CAMIONES
-- ---------------------------------------------------------------------------

CREATE TABLE mantenimiento_camion (
    id_mantenimiento   SERIAL PRIMARY KEY,
    id_camion          INT          NOT NULL,
    tipo_mantenimiento VARCHAR(20)  NOT NULL, -- PREVENTIVO, CORRECTIVO
    fecha_mantenimiento DATE        NOT NULL,
    descripcion        TEXT,
    CONSTRAINT fk_mant_camion FOREIGN KEY (id_camion)
        REFERENCES camion_ransa(id_camion)
);


-- ---------------------------------------------------------------------------
-- MÓDULO 3: PEDIDOS Y DISTRIBUCIÓN
-- ---------------------------------------------------------------------------

CREATE TABLE pedido_cliente (
    id_pedido               SERIAL PRIMARY KEY,
    id_cliente              INT          NOT NULL,
    nro_orden_origen        VARCHAR(50)  NOT NULL,
    fecha_recepcion_pedido  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_bultos            INT          NOT NULL,
    total_peso_kg           DECIMAL(10,2) NOT NULL,
    estado_pedido           VARCHAR(30)  NOT NULL DEFAULT 'RECIBIDO',
    contacto_nombre    VARCHAR(100),
    contacto_telefono  VARCHAR(15),
    contacto_correo    VARCHAR(150),
    direccion_entrega  VARCHAR(255),   -- texto legible: "Av. Los Alamos 234, Ate Vitarte"
    latitud            DECIMAL(10, 7), -- ej: -12.0431800
    longitud           DECIMAL(10, 7), -- ej: -77.0282400
    -- MODIFICACIÓN v2.0: restricciones libres del cliente sobre el pedido
    descripcion_restricciones TEXT,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente_empresa(id_cliente)
);

CREATE TABLE detalle_pedido_mercancia (
    id_detalle              SERIAL PRIMARY KEY,
    id_pedido               INT          NOT NULL,
    descripcion_mercancia   VARCHAR(255) NOT NULL,
    tipo_carga              VARCHAR(50)  NOT NULL, -- REFRIGERADA, SECA, MATPEL, GENERAL
    cantidad_bultos         INT          NOT NULL,
    peso_subtotal_kg        DECIMAL(10,2) NOT NULL,
    tipo_mercancia     VARCHAR(20),
    requiere_camion_especial VARCHAR(50),
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido_cliente(id_pedido) ON DELETE CASCADE
);

CREATE TABLE viaje_programado (
    id_viaje               SERIAL PRIMARY KEY,
    id_pedido              INT          NOT NULL,
    -- MODIFICACIÓN v2.0: id_camion e id_conductor removidos
    -- → ahora gestionados en viaje_camion_asignado (N camiones por viaje)
    codigo_reserva_patio   VARCHAR(20)  NOT NULL UNIQUE,
    tipo_operacion         VARCHAR(20)  NOT NULL, -- RECEPCION, DESPACHO
    fecha_hora_estimada    TIMESTAMP    NOT NULL,
    guia_remision_ransa    VARCHAR(50)  NOT NULL UNIQUE,
    estado_viaje           VARCHAR(30)  NOT NULL DEFAULT 'PENDIENTE',
    -- estado_viaje: PENDIENTE, CONFIRMADO, EN_TRANSITO
    programado_por_admin   INT          NOT NULL,
    -- MODIFICACIÓN v2.0: nuevas columnas de programación horaria
    fecha_limite_entrega   TIMESTAMP,
    hora_recogida_inicio   TIME,
    hora_recogida_fin      TIME,
    CONSTRAINT fk_viaje_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido_cliente(id_pedido),
    CONSTRAINT fk_viaje_admin  FOREIGN KEY (programado_por_admin)
        REFERENCES administrador(id_admin)
);


-- ---------------------------------------------------------------------------
-- MÓDULO 3 (NUEVO v2.0): ASIGNACIÓN N CAMIONES / CONDUCTORES POR VIAJE
-- ---------------------------------------------------------------------------

CREATE TABLE viaje_camion_asignado (
    id_asignacion  SERIAL PRIMARY KEY,
    id_viaje       INT NOT NULL,
    id_camion      INT NOT NULL,
    id_conductor   INT NOT NULL,
    CONSTRAINT fk_asig_viaje     FOREIGN KEY (id_viaje)
        REFERENCES viaje_programado(id_viaje),
    CONSTRAINT fk_asig_camion    FOREIGN KEY (id_camion)
        REFERENCES camion_ransa(id_camion),
    CONSTRAINT fk_asig_conductor FOREIGN KEY (id_conductor)
        REFERENCES conductor_ransa(id_conductor)
);


-- ---------------------------------------------------------------------------
-- MÓDULO 4: CONTROL DE ACCESOS PERIMETRALES
-- ---------------------------------------------------------------------------

CREATE TABLE camara_dispositivo (
    id_camara        SERIAL PRIMARY KEY,
    codigo_ip        VARCHAR(45)  NOT NULL UNIQUE,
    ubicacion_garita VARCHAR(100) NOT NULL,
    estado_hardware  VARCHAR(24)  NOT NULL DEFAULT 'OPERATIVO'
);

CREATE TABLE intento_acceso_no_registrado (
    id_intento        SERIAL PRIMARY KEY,
    placa_detectada   VARCHAR(15)  NOT NULL,
    id_camara         INT          NOT NULL,
    timestamp_intento TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    url_foto_captura  VARCHAR(255),
    confianza_alpr    DECIMAL(5,2),
    decision          VARCHAR(20)  NOT NULL DEFAULT 'DENEGADO',
    CONSTRAINT fk_intento_camara FOREIGN KEY (id_camara)
        REFERENCES camara_dispositivo(id_camara)
);

CREATE TABLE registro_acceso (
    id_acceso           SERIAL PRIMARY KEY,
    id_viaje            INT          ,
    id_camion           INT          ,
    id_conductor        INT          ,
    id_camara           INT          ,
    tipo_evento         VARCHAR(20)  , -- SALIDA_RUTA, RETORNO_RUTA
    placa_detectada_alpr VARCHAR(15) ,
    confianza_alpr      DECIMAL(5,2) ,
    url_foto_captura    VARCHAR(255),
    timestamp_evento    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_deteccion      VARCHAR(20), 
    latencia_ms           INT, 
    nivel_iluminacion     VARCHAR(20), 
    nivel_obstruccion     VARCHAR(20),
    puerta_asignada     INT,
    muelle_dock         VARCHAR(10),
    estado_barrera      VARCHAR(30)  NOT NULL, -- OPEN, CLOSED
    decision_acceso     VARCHAR(30)  NOT NULL, -- AUTORIZADO_SALIDA, AUTORIZADO_RETORNO, DENEGADO
    prioridad_envio     VARCHAR(50),
    tipo_registro       VARCHAR(20)  NOT NULL DEFAULT 'ALPR',
    revisado_por_admin  INT,
    CONSTRAINT fk_acceso_viaje     FOREIGN KEY (id_viaje)
        REFERENCES viaje_programado(id_viaje),
    CONSTRAINT fk_acceso_camion    FOREIGN KEY (id_camion)
        REFERENCES camion_ransa(id_camion),
    CONSTRAINT fk_acceso_conductor FOREIGN KEY (id_conductor)
        REFERENCES conductor_ransa(id_conductor),
    CONSTRAINT fk_acceso_camara    FOREIGN KEY (id_camara)
        REFERENCES camara_dispositivo(id_camara),
    CONSTRAINT fk_acceso_admin     FOREIGN KEY (revisado_por_admin)
        REFERENCES administrador(id_admin)
);

CREATE TABLE motivo_acceso (
    id_motivo   SERIAL PRIMARY KEY,
    id_acceso   INT         NOT NULL,
    tipo_motivo VARCHAR(30) NOT NULL,
    CONSTRAINT chk_tipo_motivo CHECK (
        tipo_motivo IN (
            'INTRUSION_SOSPECHOSA',
            'GUIA_CON_FALTANTES',
            'FALLA_CAMARA'
        )
    ),
    CONSTRAINT uq_acceso_motivo UNIQUE (id_acceso, tipo_motivo),
    CONSTRAINT fk_motivo_acceso FOREIGN KEY (id_acceso)
        REFERENCES registro_acceso(id_acceso) ON DELETE CASCADE
);

CREATE TABLE anomalia_acceso (
    id_anomalia           SERIAL PRIMARY KEY,
    id_acceso             INT         NOT NULL,
    tipo_anomalia         VARCHAR(50) NOT NULL, -- DOCUMENTACION_VENCIDA, LECTURA_FALLIDA_ALPR, etc.
    descripcion_detallada TEXT        NOT NULL,
    autorizado_preventivo BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_anomalia_acceso FOREIGN KEY (id_acceso)
        REFERENCES registro_acceso(id_acceso) ON DELETE CASCADE
);

CREATE TABLE infraccion_transito (
    id_infraccion           SERIAL PRIMARY KEY,
    id_acceso               INT         NOT NULL,
    codigo_regla            VARCHAR(10) NOT NULL,
    nivel_riesgo            VARCHAR(20) NOT NULL, -- BAJO, ALTO, CRÍTICO
    dias_suspension_aplicados INT        NOT NULL DEFAULT 0,
    timestamp_registro      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_infraccion_acceso FOREIGN KEY (id_acceso)
        REFERENCES registro_acceso(id_acceso) ON DELETE CASCADE
);


-- ---------------------------------------------------------------------------
-- MÓDULO 5: AUDITORÍA Y CONFIGURACIÓN ANALÍTICA
-- ---------------------------------------------------------------------------

CREATE TABLE auditoria_modificacion_acceso (
    id_auditoria            SERIAL PRIMARY KEY,
    id_acceso_original      INT         NOT NULL, 
    id_acceso_corregido     INT         NOT NULL,
    id_admin_modificador    INT         NOT NULL,
    campo_modificado        VARCHAR(50) NOT NULL,
    valor_original_inmutable TEXT        NOT NULL,
    valor_corregido_nuevo   TEXT        NOT NULL,
    motivo_justificacion    TEXT        NOT NULL,
    modificado_en           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_original FOREIGN KEY (id_acceso_original) 
        REFERENCES registro_acceso(id_acceso), 
    CONSTRAINT fk_audit_corregido FOREIGN KEY (id_acceso_corregido)
        REFERENCES registro_acceso(id_acceso),
    CONSTRAINT fk_audit_admin  FOREIGN KEY (id_admin_modificador)
        REFERENCES administrador(id_admin)
);

CREATE TABLE configuracion_kpi (
    id_kpi              SERIAL PRIMARY KEY,
    nombre_kpi          VARCHAR(100) NOT NULL,
    categoria_operativa VARCHAR(50)  NOT NULL, -- Operaciones, Seguridad, TI
    unidad_medida       VARCHAR(20)  NOT NULL, -- Minutos, Porcentaje, Cantidad
    formula_defined     TEXT         NOT NULL,
    umbral_critico      DECIMAL(10,2) NOT NULL,
    valor_meta          DECIMAL(10,2) NOT NULL,
    umbral_alerta       DECIMAL(10,2) NOT NULL,
    estado_kpi          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',
    creado_por          INT          NOT NULL,
    creado_en           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en        TIMESTAMP,
    CONSTRAINT fk_kpi_admin FOREIGN KEY (creado_por)
        REFERENCES administrador(id_admin)
);

CREATE TABLE snapshot_kpi_diario (
    id_snapshot         SERIAL PRIMARY KEY,
    fecha_snapshot      DATE        NOT NULL UNIQUE,
    total_vehiculos     INT         NOT NULL DEFAULT 0,
    total_autorizados   INT         NOT NULL DEFAULT 0,
    total_denegados     INT         NOT NULL DEFAULT 0,
    total_anomalias     INT         NOT NULL DEFAULT 0,
    var_pct_vehiculos   DECIMAL(5,2),
    var_pct_autorizados DECIMAL(5,2),
    var_pct_denegados   DECIMAL(5,2),
    generado_en         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE metrica_operacional_sistema (
    id_metrica      SERIAL PRIMARY KEY,
    fecha_hora      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uptime_pct      DECIMAL(5,2) NOT NULL,
    alertas_activas INT          NOT NULL DEFAULT 0,
    camaras_activas INT          NOT NULL DEFAULT 0,
    camaras_total   INT          NOT NULL DEFAULT 0
);



