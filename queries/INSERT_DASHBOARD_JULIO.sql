-- ===========================================================================
-- INSERTS PARA DASHBOARD — DATOS DE JULIO 2026
-- Fecha actual: 2026-07-01
-- ===========================================================================

-- 1. snapshot_kpi_diario — Últimos 7 días
INSERT INTO snapshot_kpi_diario
    (fecha_snapshot, total_vehiculos, total_autorizados, total_denegados, total_anomalias,
     var_pct_vehiculos, var_pct_autorizados, var_pct_denegados, generado_en)
VALUES
('2026-06-25', 135, 124, 11, 4,   3.05,   2.48,   8.33,  '2026-06-25 23:59:00'),
('2026-06-26', 142, 130, 12, 5,   5.19,   4.84,   9.09,  '2026-06-26 23:59:00'),
('2026-06-27',  88,  83,  5, 2, -38.03, -36.15, -58.33,  '2026-06-27 23:59:00'), -- sábado
('2026-06-29', 150, 138, 12, 6,  70.45,  66.27, 140.00,  '2026-06-29 23:59:00'), -- lunes
('2026-06-30', 157, 145, 12, 7,   4.67,   5.07,   0.00,  '2026-06-30 23:59:00'),
('2026-07-01', 163, 150, 13, 5,   3.82,   3.45,   8.33,  '2026-07-01 23:59:00'); -- hoy

-- 2. metrica_operacional_sistema — Estado del Sistema
INSERT INTO metrica_operacional_sistema
    (fecha_hora, uptime_pct, alertas_activas, camaras_activas, camaras_total)
VALUES
('2026-07-01 06:00:00', 99.95, 2, 1, 1),
('2026-07-01 12:00:00', 100.00, 3, 1, 1),
('2026-07-01 23:59:00', 99.87, 4, 1, 1);

-- 3. registro_acceso — Últimos Eventos (10 registros con fechas recientes)
INSERT INTO registro_acceso
    (id_viaje, id_camion, id_conductor, id_camara, tipo_evento,
     placa_detectada_alpr, confianza_alpr, timestamp_evento,
     estado_deteccion, latencia_ms, nivel_iluminacion, nivel_obstruccion,
     estado_barrera, decision_acceso, tipo_registro)
VALUES
(1,  1,  1,  1, 'ENTRADA', 'B7Y-912',  99.10, '2026-07-01 06:05:00', 'COMPLETADO',   98, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(2,  5,  3,  1, 'ENTRADA', 'D9X-334',  98.40, '2026-07-01 07:20:00', 'COMPLETADO',  112, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(3,  12, 8,  1, 'SALIDA',  'P2W-104',  97.80, '2026-07-01 08:45:00', 'COMPLETADO',  105, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(4,  3,  5,  1, 'ENTRADA', 'C5O-784',  99.30, '2026-07-01 09:30:00', 'COMPLETADO',   90, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(5,  6,  4,  1, 'ENTRADA', 'W3O-891',  42.10, '2026-07-01 10:15:00', 'ERROR EN LECTURA', 245, 'INSUFICIENTE', 'DETECTADA', 'CERRADO', 'DENEGADO', 'ALPR'),
(6,  8,  6,  1, 'ENTRADA', 'V5T-702',  98.90, '2026-07-01 11:00:00', 'COMPLETADO',  108, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(7,  13, 11, 1, 'SALIDA',  'M8I-673',  97.50, '2026-07-01 12:30:00', 'COMPLETADO',  115, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(8,  15, 9,  1, 'ENTRADA', 'O7R-402',  96.80, '2026-07-01 14:00:00', 'EN REVISION',  132, 'NORMAL',   'NINGUNA',   'CERRADO', 'DENEGADO', 'ALPR'),
(9,  2,  2,  1, 'ENTRADA', 'A4K-205',  98.70, '2026-07-01 15:45:00', 'COMPLETADO',   95, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(10, 10, 14, 1, 'SALIDA',  'Z4E-809',  97.20, '2026-07-01 17:00:00', 'COMPLETADO',  118, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
-- Una fila de días anteriores para que el gráfico semanal tenga más datos
(1,  1,  1,  1, 'SALIDA',  'B7Y-912',  99.00, '2026-06-30 14:30:00', 'COMPLETADO',  100, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(3,  12, 8,  1, 'ENTRADA', 'P2W-104',  98.30, '2026-06-30 08:00:00', 'COMPLETADO',  102, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR'),
(7,  13, 11, 1, 'ENTRADA', 'M8I-673',  41.50, '2026-06-30 06:30:00', 'ERROR EN LECTURA', 280, 'INSUFICIENTE', 'DETECTADA', 'CERRADO', 'DENEGADO', 'ALPR'),
(5,  6,  4,  1, 'SALIDA',  'W3O-891',  97.90, '2026-06-29 16:00:00', 'COMPLETADO',  110, 'NORMAL',   'NINGUNA',   'ABIERTO', 'AUTORIZADO', 'ALPR');

-- 4. motivo_acceso — Motivos de los accesos DENEGADO (1-2 motivos por acceso)
INSERT INTO motivo_acceso (id_acceso, tipo_motivo)
SELECT r.id_acceso, 'FALLA_CAMARA'
FROM registro_acceso r
WHERE r.placa_detectada_alpr = 'W3O-891' AND r.timestamp_evento = '2026-07-01 10:15:00';

INSERT INTO motivo_acceso (id_acceso, tipo_motivo)
SELECT r.id_acceso, 'GUIA_CON_FALTANTES'
FROM registro_acceso r
WHERE r.placa_detectada_alpr = 'W3O-891' AND r.timestamp_evento = '2026-07-01 10:15:00';

INSERT INTO motivo_acceso (id_acceso, tipo_motivo)
SELECT r.id_acceso, 'INTRUSION_SOSPECHOSA'
FROM registro_acceso r
WHERE r.placa_detectada_alpr = 'O7R-402' AND r.timestamp_evento = '2026-07-01 14:00:00';

INSERT INTO motivo_acceso (id_acceso, tipo_motivo)
SELECT r.id_acceso, 'FALLA_CAMARA'
FROM registro_acceso r
WHERE r.placa_detectada_alpr = 'O7R-402' AND r.timestamp_evento = '2026-07-01 14:00:00';

INSERT INTO motivo_acceso (id_acceso, tipo_motivo)
SELECT r.id_acceso, 'FALLA_CAMARA'
FROM registro_acceso r
WHERE r.placa_detectada_alpr = 'M8I-673' AND r.timestamp_evento = '2026-06-30 06:30:00';
