-- ===========================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS FINAL: SECGUARD LOGISTICS (RANSA)
-- ===========================================================================

-- --- MÓDULO 1: SEGURIDAD Y AUTENTICACIÓN ---

CREATE TABLE administrador (
    id_admin SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasenia_hash VARCHAR(255) NOT NULL,
    area_operativa VARCHAR(100) NOT NULL,
    rol_usuario VARCHAR(50) NOT NULL,
    estado_cuenta VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sesion_admin (
    id_sesion SERIAL PRIMARY KEY,
    id_admin INT NOT NULL,
    token_autenticacion VARCHAR(255) NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    ingresado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiracion_en TIMESTAMP NOT NULL,
    CONSTRAINT fk_sesion_admin FOREIGN KEY (id_admin) REFERENCES administrador(id_admin) ON DELETE CASCADE
);

-- --- MÓDULO 2: CLIENTES Y FLOTA PROPIA RANSA ---

CREATE TABLE cliente_empresa (
    id_cliente SERIAL PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    sector_industrial VARCHAR(50) NOT NULL,
    estado_cuenta VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
);

CREATE TABLE conductor_ransa (
    id_conductor SERIAL PRIMARY KEY,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    nro_brevete VARCHAR(15) NOT NULL UNIQUE,
    vigencia_sctr DATE NOT NULL,
    charla_induccion_aprobada BOOLEAN NOT NULL DEFAULT FALSE,
    estado_empleado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
);

CREATE TABLE camion_ransa (
    id_camion SERIAL PRIMARY KEY,
    placa_matricula VARCHAR(15) NOT NULL UNIQUE,
    modelo VARCHAR(50) NOT NULL,
    capacidad_toneladas DECIMAL(5,2) NOT NULL,
    tipo_unidad VARCHAR(30) NOT NULL,
    vigencia_soat DATE NOT NULL,
    vigencia_tarjeta_propiedad DATE NOT NULL,
    estado_operativo VARCHAR(24) NOT NULL DEFAULT 'DISPONIBLE'
);

-- --- MÓDULO 3: PEDIDOS Y DISTRIBUCIÓN (RUTAS) ---

CREATE TABLE pedido_cliente (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    nro_orden_origen VARCHAR(50) NOT NULL,
    fecha_recepcion_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_bultos INT NOT NULL,
    total_peso_kg DECIMAL(10,2) NOT NULL,
    estado_pedido VARCHAR(30) NOT NULL DEFAULT 'RECIBIDO',
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES cliente_empresa(id_cliente)
);

CREATE TABLE detalle_pedido_mercancia (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    descripcion_mercancia VARCHAR(255) NOT NULL,
    tipo_carga VARCHAR(50) NOT NULL, -- REFRIGERADA, SECA, MATPEL, GENERAL
    cantidad_bultos INT NOT NULL,
    peso_subtotal_kg DECIMAL(10,2) NOT NULL,
    requiere_camion_especial VARCHAR(50),
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedido_cliente(id_pedido) ON DELETE CASCADE
);

CREATE TABLE viaje_programado (
    id_viaje SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_camion INT NOT NULL,
    id_conductor INT NOT NULL,
    codigo_reserva_patio VARCHAR(20) NOT NULL UNIQUE,
    tipo_operacion VARCHAR(20) NOT NULL, -- RECEPCION, DESPACHO
    fecha_hora_estimada TIMESTAMP NOT NULL,
    guia_remision_ransa VARCHAR(50) NOT NULL UNIQUE,
    estado_viaje VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADO', -- PROGRAMADO, EN_RUTA, COMPLETADO
    programado_por_admin INT NOT NULL,
    CONSTRAINT fk_viaje_pedido FOREIGN KEY (id_pedido) REFERENCES pedido_cliente(id_pedido),
    CONSTRAINT fk_viaje_camion FOREIGN KEY (id_camion) REFERENCES camion_ransa(id_camion),
    CONSTRAINT fk_viaje_conductor FOREIGN KEY (id_conductor) REFERENCES conductor_ransa(id_conductor),
    CONSTRAINT fk_viaje_admin FOREIGN KEY (programado_por_admin) REFERENCES administrador(id_admin)
);

-- --- MÓDULO 4: CONTROL DE ACCESOS PERIMETRALES (EVENTOS INDEPENDIENTES / UNICA CÁMARA) ---

CREATE TABLE camara_dispositivo (
    id_camara SERIAL PRIMARY KEY,
    codigo_ip VARCHAR(45) NOT NULL UNIQUE,
    ubicacion_garita VARCHAR(100) NOT NULL, -- Ej: "Garita Principal de Control Perimetral"
    estado_hardware VARCHAR(24) NOT NULL DEFAULT 'OPERATIVO'
);

CREATE TABLE registro_acceso (
    id_acceso SERIAL PRIMARY KEY,
    id_viaje INT NOT NULL,
    id_camion INT NOT NULL,
    id_conductor INT NOT NULL,
    id_camara INT NOT NULL, -- Apunta a la única cámara física que procesó la placa
    tipo_evento VARCHAR(20) NOT NULL, -- 'SALIDA_RUTA' o 'RETORNO_RUTA' (Define la dirección del flujo)
    placa_detectada_alpr VARCHAR(15) NOT NULL,
    confianza_alpr DECIMAL(5,2) NOT NULL,
    url_foto_captura VARCHAR(255),
    timestamp_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Momento exacto del paso vehicular
    puerta_asignada INT,
    muelle_dock VARCHAR(10),
    estado_barrera VARCHAR(30) NOT NULL, -- OPEN, CLOSED
    decision_acceso VARCHAR(30) NOT NULL, -- AUTORIZADO_SALIDA, AUTORIZADO_RETORNO, DENEGADO
    revisado_por_admin INT NOT NULL,
    CONSTRAINT fk_acceso_viaje FOREIGN KEY (id_viaje) REFERENCES viaje_programado(id_viaje),
    CONSTRAINT fk_acceso_camion FOREIGN KEY (id_camion) REFERENCES camion_ransa(id_camion),
    CONSTRAINT fk_acceso_conductor FOREIGN KEY (id_conductor) REFERENCES conductor_ransa(id_conductor),
    CONSTRAINT fk_acceso_camara FOREIGN KEY (id_camara) REFERENCES camara_dispositivo(id_camara),
    CONSTRAINT fk_acceso_admin FOREIGN KEY (revisado_por_admin) REFERENCES administrador(id_admin)
);

CREATE TABLE anomalia_acceso (
    id_anomalia SERIAL PRIMARY KEY,
    id_acceso INT NOT NULL,
    tipo_anomalia VARCHAR(50) NOT NULL, -- DOCUMENTACION_VENCIDA, LECTURA_FALLIDA_ALPR, etc.
    descripcion_detallada TEXT NOT NULL,
    autorizado_preventivo BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_anomalia_acceso FOREIGN KEY (id_acceso) REFERENCES registro_acceso(id_acceso) ON DELETE CASCADE
);

CREATE TABLE infraccion_transito (
    id_infraccion SERIAL PRIMARY KEY,
    id_acceso INT NOT NULL,
    codigo_regla VARCHAR(10) NOT NULL,
    nivel_riesgo VARCHAR(20) NOT NULL, -- BAJO, ALTO, CRÍTICO
    dias_suspension_aplicados INT NOT NULL DEFAULT 0,
    timestamp_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_infraccion_acceso FOREIGN KEY (id_acceso) REFERENCES registro_acceso(id_acceso) ON DELETE CASCADE
);

-- --- MÓDULO 5: AUDITORÍA DE INTERFACES Y CONFIGURACIÓN ANALÍTICA ---

CREATE TABLE auditoria_modificacion_acceso (
    id_auditoria SERIAL PRIMARY KEY,
    id_acceso INT NOT NULL,
    id_admin_modificador INT NOT NULL,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_original_inmutable TEXT NOT NULL, 
    valor_corregido_nuevo TEXT NOT NULL, 
    motivo_justificacion TEXT NOT NULL,
    modificado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_acceso FOREIGN KEY (id_acceso) REFERENCES registro_acceso(id_acceso),
    CONSTRAINT fk_audit_admin FOREIGN KEY (id_admin_modificador) REFERENCES administrador(id_admin)
);

CREATE TABLE configuracion_kpi (
    id_kpi SERIAL PRIMARY KEY,
    nombre_kpi VARCHAR(100) NOT NULL,
    categoria_operativa VARCHAR(50) NOT NULL, -- Operaciones, Seguridad, TI
    unidad_medida VARCHAR(20) NOT NULL, -- Minutos, Porcentaje, Cantidad
    formula_defined TEXT NOT NULL,
    umbral_critico DECIMAL(10,2) NOT NULL,
    umbral_aceptable DECIMAL(10,2) NOT NULL,
    umbral_optimo DECIMAL(10,2) NOT NULL,
    estado_kpi VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', 
    creado_por INT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    eliminado_en TIMESTAMP, 
    CONSTRAINT fk_kpi_admin FOREIGN KEY (creado_por) REFERENCES administrador(id_admin)
);