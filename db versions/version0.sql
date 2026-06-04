-- AQUI AGREGAN EL CODIGO PARA CREAR TABLAS, VERIFIQUEN LA VERSIÓN ANTERIORS

-- AUTOR: DIOGO ABREGU (colocan su nombre aquí, el que crea la tabla)

-- DESCRIPCIÓN: AGREGAR 3 COLUMNAS NUEVAS A LA TABLA DE CAMION DE RANSA PARA LA PANTALLA DE GESTIÓN DE FLOTA (gestion_flota.html), 
-- + Y CREAR UNA NUEVA TABLA PARA EL HISTORIAL DE MANTENIMIENTO DE LOS CAMIONES (MINIMAMENTE DETALLADO).

-- =====================================================
-- MODIFICACIONES PARA MÓDULO DE GESTIÓN DE FLOTA
-- =====================================================

-- 1. Nuevas columnas en camion_ransa
ALTER TABLE camion_ransa
ADD COLUMN url_foto_vehiculo VARCHAR(255),
ALTER TABLE camion_ransa
ADD COLUMN clasificacion_peso VARCHAR(30) 
    CHECK (clasificacion_peso IN ('CARGA_PESADA', 'CARGA_MEDIA', 'COMERCIAL_LIGERO')),
ADD COLUMN fecha_proximo_mantenimiento DATE;

-- 2. Historial de mantenimiento (minimalista)
CREATE TABLE mantenimiento_camion (
    id_mantenimiento SERIAL PRIMARY KEY,
    id_camion INT NOT NULL,
    tipo_mantenimiento VARCHAR(20) NOT NULL, -- PREVENTIVO, CORRECTIVO
    fecha_mantenimiento DATE NOT NULL,
    descripcion TEXT,
    CONSTRAINT fk_mant_camion FOREIGN KEY (id_camion) REFERENCES camion_ransa(id_camion)
);