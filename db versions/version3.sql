-- AUTOR: JOSE VENEGAS
-- DESCRIPCIÓN: NUEVAS TABLAS PARA SOPORTE DE PANTALLAS 4.2.5, 4.2.21 Y 4.2.22

-- ===========================================================================
-- DROP TABLES (agregar al inicio de la Sección 1, antes de registro_acceso)
-- ===========================================================================

DROP TABLE IF EXISTS motivo_acceso                    CASCADE;
DROP TABLE IF EXISTS intento_acceso_no_registrado     CASCADE;
DROP TABLE IF EXISTS snapshot_kpi_diario              CASCADE;
DROP TABLE IF EXISTS metrica_operacional_sistema      CASCADE;


-- ===========================================================================
-- DROP SEQUENCES (agregar al inicio de la Sección 2)
-- ===========================================================================

DROP SEQUENCE IF EXISTS motivo_acceso_id_motivo_seq                         CASCADE;
DROP SEQUENCE IF EXISTS intento_acceso_no_registrado_id_intento_seq         CASCADE;
DROP SEQUENCE IF EXISTS snapshot_kpi_diario_id_snapshot_seq                 CASCADE;
DROP SEQUENCE IF EXISTS metrica_operacional_sistema_id_metrica_seq          CASCADE;


-- ===========================================================================
-- CREATE TABLES
-- ===========================================================================

-- Ubicación: después de camara_dispositivo, antes de registro_acceso
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

-- Ubicación: después de registro_acceso, antes de anomalia_acceso
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

-- Ubicación: al final, después de configuracion_kpi
CREATE TABLE snapshot_kpi_diario (
    id_snapshot         SERIAL PRIMARY KEY,
    fecha_snapshot      DATE         NOT NULL UNIQUE,
    total_vehiculos     INT          NOT NULL DEFAULT 0,
    total_autorizados   INT          NOT NULL DEFAULT 0,
    total_denegados     INT          NOT NULL DEFAULT 0,
    total_anomalias     INT          NOT NULL DEFAULT 0,
    var_pct_vehiculos   DECIMAL(5,2),
    var_pct_autorizados DECIMAL(5,2),
    var_pct_denegados   DECIMAL(5,2),
    generado_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ubicación: al final, después de snapshot_kpi_diario
CREATE TABLE metrica_operacional_sistema (
    id_metrica      SERIAL PRIMARY KEY,
    fecha_hora      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uptime_pct      DECIMAL(5,2) NOT NULL,
    alertas_activas INT          NOT NULL DEFAULT 0,
    camaras_activas INT          NOT NULL DEFAULT 0,
    camaras_total   INT          NOT NULL DEFAULT 0
);


-- ===========================================================================
-- INSERTS
-- ===========================================================================

-- Ubicación: al final del INSERT_DATA.sql, después de anomalia_acceso

INSERT INTO intento_acceso_no_registrado
    (placa_detectada, id_camara, timestamp_intento, url_foto_captura, confianza_alpr, decision)
VALUES
('XYZ-7890', 1, '2026-05-22 14:32:45', '/img/capturas/nreg_xyz7890_01.jpg',  91.20, 'DENEGADO'),
('XYZ-7890', 1, '2026-05-28 09:17:03', '/img/capturas/nreg_xyz7890_02.jpg',  88.70, 'DENEGADO'),
('TRK-4421', 1, '2026-05-23 07:14:10', '/img/capturas/nreg_trk4421_01.jpg',  87.50, 'DENEGADO'),
('LMN-9902', 1, '2026-05-25 16:43:00', '/img/capturas/nreg_lmn9902_01.jpg',  62.30, 'DENEGADO'),
('ABC-0134', 1, '2026-05-26 11:55:33', '/img/capturas/nreg_abc0134_01.jpg',  94.80, 'DENEGADO'),
('W9K-551',  1, '2026-05-27 06:28:19', '/img/capturas/nreg_w9k551_01.jpg',   96.10, 'DENEGADO'),
('F2B-803',  1, '2026-05-29 08:05:44', '/img/capturas/nreg_f2b803_01.jpg',   58.40, 'DENEGADO'),
('ZZP-1120', 1, '2026-05-30 23:41:07', '/img/capturas/nreg_zzp1120_01.jpg',  71.90, 'DENEGADO'),
('T4R-667',  1, '2026-06-01 10:22:55', '/img/capturas/nreg_t4r667_01.jpg',   93.50, 'DENEGADO'),
('T4R-667',  1, '2026-06-02 10:48:31', '/img/capturas/nreg_t4r667_02.jpg',   92.80, 'DENEGADO'),
('H6D-294',  1, '2026-06-02 14:09:22', '/img/capturas/nreg_h6d294_01.jpg',   97.20, 'DENEGADO'),
('PEN-XXX',  1, '2026-06-03 07:33:48', '/img/capturas/nreg_penxxx_01.jpg',   31.60, 'DENEGADO'),
('V7M-082',  1, '2026-06-04 05:57:12', '/img/capturas/nreg_v7m082_01.jpg',   95.70, 'DENEGADO'),
('SPC-3341', 1, '2026-06-04 19:15:40', '/img/capturas/nreg_spc3341_01.jpg',  89.30, 'DENEGADO'),
('XYZ-7890', 1, '2026-06-05 14:32:45', '/img/capturas/nreg_xyz7890_03.jpg',  90.60, 'DENEGADO');


INSERT INTO motivo_acceso (id_acceso, tipo_motivo) VALUES
(4,  'GUIA_CON_FALTANTES'),
(4,  'INTRUSION_SOSPECHOSA'),
(4,  'FALLA_CAMARA'),
(7,  'FALLA_CAMARA'),
(7,  'GUIA_CON_FALTANTES'),
(7,  'INTRUSION_SOSPECHOSA'),
(10, 'INTRUSION_SOSPECHOSA'),
(10, 'GUIA_CON_FALTANTES'),
(10, 'FALLA_CAMARA');


INSERT INTO snapshot_kpi_diario
    (fecha_snapshot, total_vehiculos, total_autorizados, total_denegados, total_anomalias,
     var_pct_vehiculos, var_pct_autorizados, var_pct_denegados, generado_en)
VALUES
('2026-05-20', 101,  93,  8, 3,   NULL,   NULL,    NULL, '2026-05-20 23:59:00'),
('2026-05-21', 108,  99,  9, 4,   6.93,   6.45,   12.50, '2026-05-21 23:59:00'),
('2026-05-22', 115, 104, 11, 5,   6.48,   5.05,   22.22, '2026-05-22 23:59:00'),
('2026-05-25', 112, 102, 10, 3,  -2.61,  -1.92,   -9.09, '2026-05-25 23:59:00'),
('2026-05-26', 119, 109, 10, 4,   6.25,   6.86,    0.00, '2026-05-26 23:59:00'),
('2026-05-27', 124, 113, 11, 6,   4.20,   3.67,   10.00, '2026-05-27 23:59:00'),
('2026-05-28', 121, 111, 10, 3,  -2.42,  -1.77,   -9.09, '2026-05-28 23:59:00'),
('2026-05-29', 127, 116, 11, 5,   4.96,   4.50,   10.00, '2026-05-29 23:59:00'),
('2026-06-01', 118, 107, 11, 4,  -7.09,  -7.76,    0.00, '2026-06-01 23:59:00'),
('2026-06-02', 122, 111, 11, 5,   3.39,   3.74,    0.00, '2026-06-02 23:59:00'),
('2026-06-03', 130, 118, 12, 6,   6.56,   6.31,    9.09, '2026-06-03 23:59:00'),
('2026-06-04', 132, 127, 14, 7,   1.54,   7.63,   16.67, '2026-06-04 23:59:00'),
('2026-06-05', 148, 134, 14, 9,  12.12,   5.51,   -2.14, '2026-06-05 23:59:00'),
('2026-06-06', 141, 138,  3, 2,  -4.73,   2.99,  -78.57, '2026-06-06 23:59:00'),
('2026-06-08', 152, 143,  9, 5,   7.80,   3.62,  200.00, '2026-06-08 23:59:00');


INSERT INTO metrica_operacional_sistema
    (fecha_hora, uptime_pct, alertas_activas, camaras_activas, camaras_total)
VALUES
('2026-05-20 23:59:00', 100.00,  2, 1, 1),
('2026-05-21 23:59:00',  99.90,  3, 1, 1),
('2026-05-22 23:59:00',  99.70,  5, 1, 1),
('2026-05-25 23:59:00', 100.00,  2, 1, 1),
('2026-05-26 23:59:00',  99.80,  4, 1, 1),
('2026-05-27 23:59:00',  98.50,  8, 1, 1),
('2026-05-28 23:59:00',  99.60,  3, 1, 1),
('2026-05-29 23:59:00',  99.90,  4, 1, 1),
('2026-06-01 23:59:00', 100.00,  1, 1, 1),
('2026-06-02 23:59:00',  99.95,  3, 1, 1),
('2026-06-03 23:59:00',  99.80,  6, 1, 1),
('2026-06-04 23:59:00',  99.70,  7, 1, 1),
('2026-06-05 16:38:18',  99.80, 12, 1, 1),
('2026-06-06 23:59:00',  99.90,  1, 1, 1),
('2026-06-08 23:59:00', 100.00,  3, 1, 1);