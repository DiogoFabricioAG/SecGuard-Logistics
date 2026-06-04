-- ===========================================================================
-- SCRIPT DE LLENADO DE DATOS REGULAR: SECGUARD LOGISTICS
-- ===========================================================================

-- 1. MÓDULO 1: SEGURIDAD Y AUTENTICACIÓN (3 Administradores y sus sesiones)
INSERT INTO administrador (nombres, apellidos, correo_electronico, nombre_usuario, contrasenia_hash, area_operativa, rol_usuario) VALUES
('Carlos', 'Mendoza', 'carlos.mendoza@ransa.com.pe', 'cmendoza', '$2b$10$eXamPleHash123', 'Planificación de Distribución', 'Supervisor'),
('Jorge', 'Alva', 'jorge.alva@ransa.com.pe', 'jalva', '$2b$10$eXamPleHash456', 'Seguridad de Garita y Patio', 'Guardia'),
('Sofía', 'Castro', 'sofia.castro@ransa.com.pe', 'scastro', '$2b$10$eXamPleHash789', 'Control de Operaciones Centro', 'Supervisor');

INSERT INTO sesion_admin (id_admin, token_autenticacion, ip_origen, ingresado_en, expiracion_en) VALUES
(1, 'token_carlos_2026', '192.168.10.45', '2026-06-03 07:00:00', '2026-06-03 15:00:00'),
(2, 'token_jorge_2026', '192.168.50.200', '2026-06-03 07:15:00', '2026-06-03 19:15:00'),
(3, 'token_sofia_2026', '192.168.10.46', '2026-06-03 14:30:00', '2026-06-03 22:30:00');


-- 2. MÓDULO 2: CLIENTES Y FLOTA PROPIA RANSA (3 Clientes, 4 Conductores, 4 Camiones)
INSERT INTO cliente_empresa (ruc, razon_social, sector_industrial) VALUES
('20100131772', 'ALICORP S.A.A.', 'Consumo Masivo / Alimentos'),
('20100017481', 'CERVECERIA PERUANA BACKUS Y JOHNSTON S.A.A.', 'Bebidas'),
('20503612542', 'QUIMICA SUIZA S.A.C.', 'Farmacéutico / Químico');

INSERT INTO conductor_ransa (dni, nombres, apellidos, nro_brevete, vigencia_sctr, charla_induccion_aprobada) VALUES
('45789123', 'Manuel', 'Soto Riva', 'Q45789123', '2027-01-15', TRUE),
('70123456', 'Christian', 'Gómez Paz', 'T70123456', '2026-12-20', TRUE),
('10457892', 'Roberto', 'Carlos Mendez', 'A10457892', '2026-08-30', TRUE),
('41258963', 'Luis', 'Estrada Torres', 'B41258963', '2026-05-15', TRUE); -- SCTR Vencido para pruebas de alertas

INSERT INTO camion_ransa (placa_matricula, modelo, capacidad_toneladas, tipo_unidad, vigencia_soat, vigencia_tarjeta_propiedad) VALUES
('F3G-894', 'Volvo FMX Heavy', 25.00, 'Tractocamión Semirremolque', '2027-03-01', '2030-05-20'),
('B7V-112', 'Isuzu Forward', 12.00, 'Furgón Cerrado Secco', '2026-11-10', '2029-08-14'),
('A5M-781', 'Mercedes-Benz Accelo', 8.00, 'Furgón Refrigerado', '2027-02-18', '2031-01-10'),
('C4R-993', 'Freightliner Cascadia', 28.00, 'Plataforma Abierta', '2026-10-05', '2029-11-02');

-- Cámara única física perimetral
INSERT INTO camara_dispositivo (codigo_ip, ubicacion_garita) VALUES
('192.168.50.11', 'Garita Principal Acceso Único - Lente ALPR');


-- 3. MÓDULO 3: PEDIDOS Y VIAJES PROGRAMADOS (6 registros ordenados cronológicamente)
INSERT INTO pedido_cliente (id_cliente, nro_orden_origen, fecha_recepcion_pedido, total_bultos, total_peso_kg, estado_pedido) VALUES
(1, 'OC-ALICORP-0415', '2026-04-14 09:00:00', 40, 18000.00, 'ATENDIDO'),  -- Pedido 1 (Histórico Abril)
(2, 'OC-BACKUS-0510', '2026-05-09 11:30:00', 120, 26000.00, 'ATENDIDO'), -- Pedido 2 (Histórico Mayo)
(1, 'OC-ALICORP-0522', '2026-05-21 15:00:00', 35, 14500.00, 'ATENDIDO'),  -- Pedido 3 (Histórico Mayo)
(1, 'OC-ALICORP-HOY1', '2026-06-03 06:00:00', 25, 11000.00, 'ATENDIDO'),  -- Pedido 4 (Hoy - Completado)
(2, 'OC-BACKUS-HOY2', '2026-06-03 08:30:00', 90, 21000.00, 'EN_RUTA'),    -- Pedido 5 (Hoy - En ruta activo)
(3, 'OC-QMSUIZA-HOY3', '2026-06-03 10:00:00', 12, 3500.00, 'RECIBIDO');   -- Pedido 6 (Hoy - Rechazado en puerta)

-- Detalles de mercancía respectivos
INSERT INTO detalle_pedido_mercancia (id_pedido, descripcion_mercancia, tipo_carga, cantidad_bultos, peso_subtotal_kg, requiere_camion_especial) VALUES
(1, 'Pallets de Aceite Primor', 'SECA', 40, 18000.00, 'General'),
(2, 'Pallets de Cerveza Pilsen Botella', 'GENERAL', 120, 26000.00, 'Plataforma Abierta'),
(3, 'Cajas de Mayonesa Alacena', 'REFRIGERADA', 35, 14500.00, 'Furgón Refrigerado'),
(4, 'Pallets de Detergente Bolívar', 'SECA', 25, 11000.00, 'General'),
(5, 'Pallets de Cerveza Cristal Lata', 'GENERAL', 90, 21000.00, 'Plataforma Abierta'),
(6, 'Insumos Médicos / Vacunas', 'MATPEL', 12, 3500.00, 'Furgón Refrigerado Certificado');

-- Asignación de Viajes
INSERT INTO viaje_programado (id_pedido, id_camion, id_conductor, codigo_reserva_patio, tipo_operacion, fecha_hora_estimada, guia_remision_ransa, estado_viaje, programado_por_admin) VALUES
(1, 1, 1, 'RES-2026-H1', 'DESPACHO', '2026-04-15 08:00:00', 'GR-RANSA-0415', 'COMPLETADO', 1),
(2, 4, 2, 'RES-2026-H2', 'DESPACHO', '2026-05-10 07:00:00', 'GR-RANSA-0510', 'COMPLETADO', 1),
(3, 3, 3, 'RES-2026-H3', 'DESPACHO', '2026-05-22 08:30:00', 'GR-RANSA-0522', 'COMPLETADO', 1),
(4, 1, 1, 'RES-2026-L1', 'DESPACHO', '2026-06-03 07:30:00', 'GR-RANSA-0603A', 'COMPLETADO', 3),
(5, 4, 2, 'RES-2026-L2', 'DESPACHO', '2026-06-03 09:15:00', 'GR-RANSA-0603B', 'EN_RUTA', 3),
(6, 2, 4, 'RES-2026-L3', 'DESPACHO', '2026-06-03 11:00:00', 'GR-RANSA-0603C', 'PROGRAMADO', 3);


-- ---------------------------------------------------------------------------
-- 4. MÓDULO 4: CONTROL DE ACCESOS PERIMETRALES (Flujos en la línea de tiempo)
-- ---------------------------------------------------------------------------

-- === DATA HISTÓRICA (Para Pantalla de KPIs por Periodos y Pantalla de Reportes PDF/CSV) ===

-- Viaje Histórico 1 (Abril): Flujo Normal Exitoso. Salió 08:05, volvió 13:20 (Duración: 315 min - ÓPTIMO)
INSERT INTO registro_acceso (id_viaje, id_camion, id_conductor, id_camara, tipo_evento, placa_detectada_alpr, confianza_alpr, timestamp_evento, puerta_asignada, muelle_dock, estado_barrera, decision_acceso, revisado_por_admin) VALUES
(1, 1, 1, 1, 'SALIDA_RUTA', 'F3G-894', 98.40, '2026-04-15 08:05:00', 1, 'Muelle 01', 'OPEN', 'AUTORIZADO_SALIDA', 2),
(1, 1, 1, 1, 'RETORNO_RUTA', 'F3G-894', 99.10, '2026-04-15 13:20:00', 1, 'Muelle 01', 'OPEN', 'AUTORIZADO_RETORNO', 2);

-- Viaje Histórico 2 (Mayo): Retraso Crítico en Ruta. Salió 07:10, volvió 19:40 (Duración: 750 min - CRÍTICO)
INSERT INTO registro_acceso (id_viaje, id_camion, id_conductor, id_camara, tipo_evento, placa_detectada_alpr, confianza_alpr, timestamp_evento, puerta_asignada, muelle_dock, estado_barrera, decision_acceso, revisado_por_admin) VALUES
(2, 4, 2, 1, 'SALIDA_RUTA', 'C4R-993', 96.50, '2026-05-10 07:10:00', 2, 'Muelle 04', 'OPEN', 'AUTORIZADO_SALIDA', 2),
(2, 4, 2, 1, 'RETORNO_RUTA', 'C4R-993', 97.20, '2026-05-10 19:40:00', 2, 'Muelle 04', 'OPEN', 'AUTORIZADO_RETORNO', 2);

-- Viaje Histórico 3 (Mayo): Flujo Normal. Salió 08:45, volvió 14:15 (Duración: 330 min - ACEPTABLE)
INSERT INTO registro_acceso (id_viaje, id_camion, id_conductor, id_camara, tipo_evento, placa_detectada_alpr, confianza_alpr, timestamp_evento, puerta_asignada, muelle_dock, estado_barrera, decision_acceso, revisado_por_admin) VALUES
(3, 3, 3, 1, 'SALIDA_RUTA', 'A5M-781', 98.90, '2026-05-22 08:45:00', 1, 'Muelle 02', 'OPEN', 'AUTORIZADO_SALIDA', 2),
(3, 3, 3, 1, 'RETORNO_RUTA', 'A5M-781', 99.00, '2026-05-22 14:15:00', 1, 'Muelle 02', 'OPEN', 'AUTORIZADO_RETORNO', 2);


-- === DATA EN TIEMPO REAL (Para el Dashboard operativo Live de HOY: 3 de Junio de 2026) ===

-- Viaje 4 (Hoy mañana): Ya completó el circuito temprano.
INSERT INTO registro_acceso (id_viaje, id_camion, id_conductor, id_camara, tipo_evento, placa_detectada_alpr, confianza_alpr, timestamp_evento, puerta_asignada, muelle_dock, estado_barrera, decision_acceso, revisado_por_admin) VALUES
(4, 1, 1, 1, 'SALIDA_RUTA', 'F3G-894', 99.30, '2026-06-03 07:42:10', 1, 'Muelle 01', 'OPEN', 'AUTORIZADO_SALIDA', 2),
(4, 1, 1, 1, 'RETORNO_RUTA', 'F3G-894', 99.50, '2026-06-03 12:10:15', 1, 'Muelle 01', 'OPEN', 'AUTORIZADO_RETORNO', 2);

-- Viaje 5 (Hoy mediodía): Camión se encuentra afuera actualmente (Solo registra salida, tipo_evento = 'SALIDA_RUTA')
INSERT INTO registro_acceso (id_viaje, id_camion, id_conductor, id_camara, tipo_evento, placa_detectada_alpr, confianza_alpr, url_foto_captura, timestamp_evento, puerta_asignada, muelle_dock, estado_barrera, decision_acceso, revisado_por_admin) VALUES
(5, 4, 2, 1, 'SALIDA_RUTA', 'C4R-993', 98.12, 'https://s3.ransa.com/capturas/2026/06/ruta_activa.jpg', '2026-06-03 09:22:40', 2, 'Muelle 05', 'OPEN', 'AUTORIZADO_SALIDA', 2);

-- Viaje 6 (Hace unos momentos): Intento de salida fallido. Conductor Luis Estrada tiene SCTR vencido.
INSERT INTO registro_acceso (id_viaje, id_camion, id_conductor, id_camara, tipo_evento, placa_detectada_alpr, confianza_alpr, url_foto_captura, timestamp_evento, puerta_asignada, muelle_dock, estado_barrera, decision_acceso, revisado_por_admin) VALUES
(6, 2, 4, 1, 'SALIDA_RUTA', 'B7V-112', 94.60, 'https://s3.ransa.com/capturas/2026/06/bloqueo_sctr.jpg', '2026-06-03 11:15:02', 1, NULL, 'CLOSED', 'DENEGADO', 2);

-- Inyección de anomalía e infracción asociadas al rechazo en vivo (id_acceso = 8)
INSERT INTO anomalia_acceso (id_acceso, tipo_anomalia, descripcion_detallada, autorizado_preventivo) VALUES
(8, 'DOCUMENTACION_VENCIDA', 'Se bloqueó la apertura de la barrera vehicular automáticamente debido a que el chofer Luis Estrada cuenta con la póliza SCTR expirada desde mayo.', FALSE);

INSERT INTO infraccion_transito (id_acceso, codigo_regla, nivel_riesgo, dias_suspension_aplicados) VALUES
(8, 'RN-SCTR', 'CRÍTICO', 15);


-- ---------------------------------------------------------------------------
-- 5. MÓDULO 5: AUDITORÍA DE INTERFACES Y CONFIGURACIÓN ANALÍTICA
-- ---------------------------------------------------------------------------

-- Registro de corrección ALPR en el primer viaje histórico para simular la pantalla de trazabilidad
INSERT INTO auditoria_modificacion_acceso (id_acceso, id_admin_modificador, campo_modificado, valor_original_inmutable, valor_corregido_nuevo, motivo_justificacion, modificado_en) VALUES
(1, 1, 'placa_detectada_alpr', 'F36-894', 'F3G-894', 'La cámara LPR interpretó de forma errónea la letra G confundiéndola con un 6 por reflejo solar. Se procedió a corregir manualmente validando contra la Guía de Remisión física.', '2026-04-15 08:12:00');

-- 3 KPIs Base con sus reglas de negocio e indicadores
INSERT INTO configuracion_kpi (nombre_kpi, categoria_operativa, unidad_medida, formula_defined, umbral_critico, umbral_aceptable, umbral_optimo, creado_por) VALUES
('Tiempo en Ruta (Turnaround Time)', 'Operaciones', 'Minutos', 'timestamp_evento(RETORNO) - timestamp_evento(SALIDA)', 480.00, 360.00, 240.00, 1),
('Tasa de Fiabilidad ALPR', 'Tecnología', 'Porcentaje', '(Lecturas_Correctas / Lecturas_Totales) * 100', 90.00, 95.00, 99.00, 1),
('Alertas por Documentación Vencida', 'Seguridad', 'Cantidad', 'COUNT(id_anomalia)', 5.00, 2.00, 0.00, 1);