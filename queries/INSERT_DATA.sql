-- ===========================================================================
-- SCRIPT DE INSERTS: SECGUARD LOGISTICS (RANSA)
-- AUTOR: DIOGO ABREGU
-- DESCRIPCIÓN: Datos de prueba realistas para el contexto peruano.
--              Cubre tablas base y las modificaciones acordadas.
-- ===========================================================================


-- ===========================================================================
-- MÓDULO 1: ADMINISTRADORES (requerido como FK base)
-- ===========================================================================

INSERT INTO administrador (nombres, apellidos, correo_electronico, nombre_usuario, contrasenia_hash, estado_cuenta) VALUES
('Carlos Ernesto',   'Villalobos Quispe',   'c.villalobos@ransa.pe',   'cvillalobos',   '$2b$12$KLMxyz123abc', 'ACTIVO'),
('María Fernanda',   'Salas Huanca',        'm.salas@ransa.pe',        'msalas',        '$2b$12$ABCdef456ghi', 'ACTIVO'),
('Jorge Luis',       'Paredes Cárdenas',    'j.paredes@ransa.pe',      'jparedes',      '$2b$12$DEFghi789jkl', 'ACTIVO'),
('Lucía Beatriz',    'Ramírez Flores',      'l.ramirez@ransa.pe',      'lramirez',      '$2b$12$GHIjkl012mno', 'ACTIVO'),
('Andrés Felipe',    'Chávez Mendoza',      'a.chavez@ransa.pe',       'achavez',       '$2b$12$JKLmno345pqr', 'INACTIVO');


-- ===========================================================================
-- MÓDULO 2: CLIENTES EMPRESA (15 empresas reales peruanas)
-- ===========================================================================

INSERT INTO cliente_empresa (ruc, razon_social, sector_industrial, estado_cuenta) VALUES
('20100055237', 'ALICORP S.A.A.',                          'CONSUMO_MASIVO',    'ACTIVO'),
('20331066703', 'GLORIA S.A.',                             'LACTEOS',           'ACTIVO'),
('20100094135', 'BACKUS Y JOHNSTON S.A.A.',                'BEBIDAS',           'ACTIVO'),
('20109072177', 'SAGA FALABELLA S.A.',                     'RETAIL',            'ACTIVO'),
('20512002090', 'SUPERMERCADOS PERUANOS S.A.',             'RETAIL',            'ACTIVO'),
('20419026809', 'CORPORACION LINDLEY S.A.',                'BEBIDAS',           'ACTIVO'),
('20100022428', 'PROCTER & GAMBLE PERU S.R.L.',            'CONSUMO_MASIVO',    'ACTIVO'),
('20205967308', 'NESTLE PERU S.A.',                        'ALIMENTOS',         'ACTIVO'),
('20100105862', 'LAIVE S.A.',                              'LACTEOS',           'ACTIVO'),
('20260458861', 'TOTTUS S.A.',                             'RETAIL',            'ACTIVO'),
('20371614515', 'INDUSTRIAS SAN MIGUEL S.A.',              'BEBIDAS',           'ACTIVO'),
('20100087198', 'UNILEVER ANDINA PERU S.A.',               'CONSUMO_MASIVO',    'ACTIVO'),
('20429868040', 'CENCOSUD RETAIL PERU S.A.',               'RETAIL',            'INACTIVO'),
('20553234060', 'ARCA CONTINENTAL LINDLEY S.A.',           'BEBIDAS',           'ACTIVO'),
('20261530061', 'BIMBO DEL PERU S.A.',                     'ALIMENTOS',         'ACTIVO');


-- ===========================================================================
-- MÓDULO 2: CONDUCTORES RANSA (15 conductores)
-- ===========================================================================

INSERT INTO conductor_ransa (dni, nombres, apellidos, nro_brevete, vigencia_sctr, charla_induccion_aprobada, empresa_transportista, estado_empleado) VALUES
('45890123', 'Carlos Eduardo', 'Mendoza Salvatierra', 'M45890123-A3C', '2026-12-31', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('70123456', 'Julio César', 'Guerrero Palomino', 'G70123456-A3B', '2026-10-15', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('10456789', 'Segundo Manuel', 'Benites Aranda', 'B10456789-A3B', '2026-11-20', TRUE, 'Transportes Integrados SAC', 'ACTIVO'),
('42156734', 'Jorge Luis', 'Altamirano Vega', 'A42156734-A2B', '2026-09-05', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('09876543', 'Christian David', 'Aparicio Castro', 'A09876543-A3C', '2027-01-10', TRUE, 'Logística Avanzada Perú', 'ACTIVO'),
('75432109', 'Walter Hugo', 'Chura Ticona', 'C75432109-A3B', '2026-08-18', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('44321098', 'Oscar Aurelio', 'Vargas Machuca', 'V44321098-A3C', '2026-07-25', TRUE, 'Transportes del Sur EIRL', 'ACTIVO'),
('25789123', 'Enrique Alfonso', 'Cáceres Pardo', 'C25789123-A2B', '2026-10-30', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('41908234', 'Alan Pierre', 'Gallardo Segura', 'G41908234-A3B', '2026-11-01', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('73019284', 'Gino Paolo', 'Ribeiro Falconí', 'R73019284-A3C', '2026-12-12', TRUE, 'Servicios Logísticos S.A.', 'ACTIVO'),
('47123894', 'Ronald Iván', 'Morales Gutiérrez', 'M47123894-A3B', '2026-09-24', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('32984123', 'Félix Alejandro', 'Zegarra Quiroz', 'Z32984123-A2B', '2026-08-11', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('40392817', 'Victor Raul', 'Haya de la Torre', 'H40392817-A3B', '2026-10-02', TRUE, 'Transportes Mercurio', 'ACTIVO'),
('71928374', 'Yuri Alexander', 'Poma Condori', 'P71928374-A3C', '2026-07-19', TRUE, 'Ransa Comercial S.A.', 'ACTIVO'),
('46571239', 'Jaime Francisco', 'Ugarte Elías', 'U46571239-A3B', '2026-11-15', TRUE, 'Ransa Comercial S.A.', 'ACTIVO');


-- ===========================================================================
-- MÓDULO 2: CAMIONES RANSA (15 camiones con nuevas columnas)
-- ===========================================================================

INSERT INTO camion_ransa (placa_matricula, modelo, capacidad_toneladas, tipo_unidad, vigencia_soat, vigencia_tarjeta_propiedad, observaciones, estado_operativo, url_foto_vehiculo, clasificacion_peso, fecha_proximo_mantenimiento) VALUES
('B7Y-912', 'Volvo FMX 460', 32.00, 'TRACTO_CAMION', '2027-01-15', '2028-06-30', 'Unidad con GPS dual activo', 'DISPONIBLE', '/img/flota/B7Y912.jpg', 'CARGA_PESADA', '2026-08-10'),
('A4K-205', 'Scania G450 Streamline', 28.00, 'TRACTO_CAMION', '2026-12-01', '2027-11-15', 'Frenos ABS revisados', 'DISPONIBLE', '/img/flota/A4K205.jpg', 'CARGA_PESADA', '2026-07-22'),
('C5O-784', 'Mercedes-Benz Axor 2644', 26.00, 'TRACTO_CAMION', '2026-10-20', '2027-09-05', 'Filtro de partículas nuevo', 'DISPONIBLE', '/img/flota/C5O784.jpg', 'CARGA_PESADA', '2026-08-01'),
('F8U-112', 'International WorkStar', 18.00, 'CAMION_RIGIDO', '2026-11-18', '2027-04-12', 'Tolva abierta con barandas', 'DISPONIBLE', '/img/flota/F8U112.jpg', 'CARGA_MEDIA', '2026-09-14'),
('D9X-334', 'Hino FM1A 700', 16.00, 'CAMION_RIGIDO', '2027-02-05', '2028-01-20', 'Caja cerrada furgonada', 'DISPONIBLE', '/img/flota/D9X334.jpg', 'CARGA_MEDIA', '2026-07-15'),
('W3O-891', 'Isuzu Forward FRR', 10.00, 'CAMION_RIGIDO', '2026-09-12', '2027-08-11', 'Distribución urbana retail', 'DISPONIBLE', '/img/flota/W3O891.jpg', 'CARGA_MEDIA', '2026-06-30'),
('E2P-445', 'Fuso FJ 2528', 15.00, 'CAMION_RIGIDO', '2026-12-28', '2027-10-14', 'Ideal para reparto masivo', 'DISPONIBLE', '/img/flota/E2P445.jpg', 'CARGA_MEDIA', '2026-08-05'),
('V5T-702', 'Hyundai HD120', 8.50, 'FURGON', '2027-03-01', '2028-02-18', 'Equipo frigorífico Thermo King', 'DISPONIBLE', '/img/flota/V5T702.jpg', 'COMERCIAL_LIGERO', '2026-07-10'),
('X1M-556', 'Jac HFC 1061', 5.00, 'FURGON', '2026-08-22', '2027-07-19', 'Furgón de fibra de vidrio', 'DISPONIBLE', '/img/flota/X1M556.jpg', 'COMERCIAL_LIGERO', '2026-06-25'),
('Z4E-809', 'Kia Frontier K2500', 2.50, 'FURGON', '2026-11-05', '2027-05-20', 'Reparto capilar Lima Metropolitana', 'DISPONIBLE', '/img/flota/Z4E809.jpg', 'COMERCIAL_LIGERO', '2026-08-20'),
('Y6N-221', 'Volvo FM 420', 24.00, 'TRACTO_CAMION', '2026-07-14', '2027-06-01', 'Requiere cambio de neumáticos traseros', 'DISPONIBLE', '/img/flota/Y6N221.jpg', 'CARGA_PESADA', '2026-06-18'),
('P2W-104', 'Scania R500 V8', 30.00, 'TRACTO_CAMION', '2027-04-01', '2028-03-12', 'Flota Premium operaciones especiales', 'DISPONIBLE', '/img/flota/P2W104.jpg', 'CARGA_PESADA', '2026-09-02'),
('M8I-673', 'Kenworth T660', 28.00, 'TRACTO_CAMION', '2026-09-30', '2027-08-25', 'Unidad asignada a ruta norte piura', 'DISPONIBLE', '/img/flota/M8I673.jpg', 'CARGA_PESADA', '2026-07-05'),
('Q3B-519', 'Freightliner M2 112', 20.00, 'CAMION_RIGIDO', '2026-10-11', '2027-09-14', 'Revisión técnica vencimiento cercano', 'DISPONIBLE', '/img/flota/Q3B519.jpg', 'CARGA_MEDIA', '2026-07-11'),
('O7R-402', 'Chevrolet NQR', 6.00, 'FURGON', '2027-01-22', '2028-01-10', 'Furgón Seco Operaciones Lima', 'DISPONIBLE', '/img/flota/O7R402.jpg', 'COMERCIAL_LIGERO', '2026-08-15');


-- ===========================================================================
-- MÓDULO 3: PEDIDOS CLIENTE (20 pedidos con nuevas columnas)
-- ===========================================================================

INSERT INTO pedido_cliente (
    id_cliente, nro_orden_origen, fecha_recepcion_pedido,
    total_bultos, total_peso_kg, estado_pedido, descripcion_restricciones,
    contacto_nombre, contacto_telefono, contacto_correo,
    direccion_entrega, latitud, longitud
) VALUES
-- id_cliente=1 | Alicorp — Planta Callao
(1,  'OC-ALC-2025-0341', '2025-05-02 08:30:00',  320, 12500.00, 'RECIBIDO',
 'No recepcionar entre 12:00 PM y 1:00 PM (Refrigerio). Requiere zona de descarga refrigerada.',
 'Carmen Villanueva', '987 654 321', 'c.villanueva@alicorp.com.pe',
 'Av. Argentina 4793, Callao',
 -12.0519800, -77.1089500),

-- id_cliente=2 | Gloria — Planta Ate
(2,  'OC-GLO-2025-0892', '2025-05-03 09:15:00',  210,  8400.00, 'EN_PROCESO',
 'Solo ingresar por puerta lateral. No recepcionar sábados después de las 3:00 PM.',
 'Roberto Quispe', '991 234 567', 'r.quispe@gloria.com.pe',
 'Av. Nicolas Ayllon 3986, Ate Vitarte',
 -12.0267400, -76.9631200),

-- id_cliente=3 | Backus — Planta Ate
(3,  'OC-BAC-2025-1123', '2025-05-03 10:45:00',  450, 18200.00, 'RECIBIDO',
 NULL,
 'Luis Paredes', '976 543 210', 'l.paredes@backus.com.pe',
 'Av. Separadora Industrial 2050, Ate Vitarte',
 -12.0345100, -76.9482300),

-- id_cliente=4 | Saga Falabella — CD Huachipa
(4,  'OC-SAG-2025-0567', '2025-05-04 07:00:00',  180,  5300.00, 'COMPLETADO',
 'Coordinación previa con jefe de almacén Sr. Huanca. Ingreso solo por muelle 4.',
 'Jorge Huanca', '965 432 109', 'j.huanca@falabella.com.pe',
 'Carretera Central Km 7.5, Huachipa',
 -12.0123400, -76.9234500),

-- id_cliente=5 | Supermercados Peruanos — CD Lurín
(5,  'OC-SPP-2025-0234', '2025-05-04 11:20:00',  390, 15600.00, 'EN_PROCESO',
 'No recepcionar entre 1:00 PM y 2:00 PM. Presentar guía de remisión en garita antes de ingresar.',
 'Ana Flores', '954 321 098', 'a.flores@spsa.com.pe',
 'Av. Industrial 1550, Lurín',
 -12.2731500, -76.8923100),

-- id_cliente=6 | Lindley — Planta Zárate
(6,  'OC-LIN-2025-0781', '2025-05-05 08:00:00',  260,  9800.00, 'RECIBIDO',
 NULL,
 'Miguel Torres', '943 210 987', 'm.torres@lindley.com.pe',
 'Av. Las Torres 555, Zárate, San Juan de Lurigancho',
 -12.0089700, -77.0012300),

-- id_cliente=7 | Pepsico / Yomost — CD Santa Anita
(7,  'OC-PYG-2025-0412', '2025-05-05 09:30:00',  140,  4200.00, 'RECIBIDO',
 'Producto sensible a temperatura. Camión debe contar con sistema de refrigeración activo.',
 'Sandra Mamani', '932 109 876', 's.mamani@pepsico.com',
 'Av. La Cultura 1200, Santa Anita',
 -12.0456700, -76.9789400),

-- id_cliente=8 | Nestlé — Planta Huachipa
(8,  'OC-NES-2025-0658', '2025-05-06 10:00:00',  300, 11000.00, 'EN_PROCESO',
 'Entrega en planta Huachipa. Coordinar con logística interna al menos 2 horas antes.',
 'Carlos Mendoza', '921 098 765', 'c.mendoza@nestle.com',
 'Carretera Central Km 6, Huachipa',
 -12.0098700, -76.9312800),

-- id_cliente=9 | Laive — Planta Santa Anita
(9,  'OC-LAI-2025-0293', '2025-05-06 14:30:00',  170,  6100.00, 'COMPLETADO',
 NULL,
 'Patricia Salas', '910 987 654', 'p.salas@laive.com.pe',
 'Av. Separadora Industrial 980, Santa Anita',
 -12.0512300, -76.9701200),

-- id_cliente=10 | Tottus — CD Lurín
(10, 'OC-TOT-2025-1045', '2025-05-07 08:45:00',  420, 17300.00, 'RECIBIDO',
 'No recepcionar domingos ni feriados. Descarga exclusiva en zona B del almacén central.',
 'Fernando Chávez', '909 876 543', 'f.chavez@tottus.com.pe',
 'Panamericana Sur Km 23.5, Lurín',
 -12.2812400, -76.8801700),

-- id_cliente=11 | Ismo / Intradevco — Planta Ventanilla
(11, 'OC-ISM-2025-0374', '2025-05-07 11:00:00',  195,  7200.00, 'EN_PROCESO',
 NULL,
 'Rosa Cárdenas', '998 765 432', 'r.cardenas@intradevco.com.pe',
 'Av. Néstor Gambetta 8956, Ventanilla',
 -11.8923400, -77.1234500),

-- id_cliente=12 | Unilever — CD Ate
(12, 'OC-UNI-2025-0829', '2025-05-08 09:00:00',  230,  8900.00, 'RECIBIDO',
 'Embalaje especial para productos líquidos. No apilar más de 3 niveles.',
 'Diego Herrera', '987 654 320', 'd.herrera@unilever.com',
 'Av. Separadora Industrial 1780, Ate Vitarte',
 -12.0378900, -76.9534600),

-- id_cliente=13 | Tottus — CD Lurín (CANCELADO)
(13, 'OC-TOT-2025-1102', '2025-05-08 13:15:00',  310, 12100.00, 'CANCELADO',
 'Pedido cancelado por cliente. Motivo: cambio de proveedor logístico.',
 'Fernando Chávez', '909 876 543', 'f.chavez@tottus.com.pe',
 'Panamericana Sur Km 23.5, Lurín',
 -12.2812400, -76.8801700),

-- id_cliente=14 | Arcelor / Aceros — Planta Villa El Salvador
(14, 'OC-ARC-2025-0516', '2025-05-09 07:30:00',  480, 19500.00, 'EN_PROCESO',
 'Ingreso únicamente por puerta norte. Requiere 2 operarios de descarga del cliente.',
 'Víctor Ríos', '976 543 211', 'v.rios@arcelormittal.com',
 'Av. El Sol 345, Villa El Salvador',
 -12.2143700, -76.9312100),

-- id_cliente=15 | Bimbo — Planta Callao
(15, 'OC-BIM-2025-0187', '2025-05-09 10:20:00',  150,  4800.00, 'RECIBIDO',
 NULL,
 'Lucía Espinoza', '965 432 108', 'l.espinoza@grupobimbo.com',
 'Av. Colonial 2341, Callao',
 -12.0623400, -77.1156700),

-- id_cliente=1 | Alicorp — 2da entrega (misma planta Callao)
(1,  'OC-ALC-2025-0388', '2025-05-10 08:00:00',  360, 14200.00, 'EN_PROCESO',
 'Segunda entrega del mes. Mismas restricciones que pedido anterior OC-ALC-2025-0341.',
 'Carmen Villanueva', '987 654 321', 'c.villanueva@alicorp.com.pe',
 'Av. Argentina 4793, Callao',
 -12.0519800, -77.1089500),

-- id_cliente=2 | Gloria — 2da entrega (misma planta Ate)
(2,  'OC-GLO-2025-0941', '2025-05-10 09:45:00',  200,  7800.00, 'RECIBIDO',
 'No recepcionar entre 12:00 PM y 1:30 PM. Verificar temperatura de carga al ingreso.',
 'Roberto Quispe', '991 234 567', 'r.quispe@gloria.com.pe',
 'Av. Nicolas Ayllon 3986, Ate Vitarte',
 -12.0267400, -76.9631200),

-- id_cliente=4 | Saga Falabella — 2do pedido CD Huachipa
(4,  'OC-SAG-2025-0601', '2025-05-11 11:30:00',  275, 10300.00, 'RECIBIDO',
 NULL,
 'Jorge Huanca', '965 432 109', 'j.huanca@falabella.com.pe',
 'Carretera Central Km 7.5, Huachipa',
 -12.0123400, -76.9234500),

-- id_cliente=6 | Lindley — 2do pedido Zárate
(6,  'OC-LIN-2025-0834', '2025-05-11 14:00:00',  190,  7100.00, 'EN_PROCESO',
 'Carga de bebidas carbonatadas. Evitar movimientos bruscos durante el transporte.',
 'Miguel Torres', '943 210 987', 'm.torres@lindley.com.pe',
 'Av. Las Torres 555, Zárate, San Juan de Lurigancho',
 -12.0089700, -77.0012300),

-- id_cliente=8 | Nestlé — 2do pedido Ate Vitarte
(8,  'OC-NES-2025-0712', '2025-05-12 08:30:00',  340, 13400.00, 'RECIBIDO',
 'Planta Ate Vitarte. Horario de recepción solo de 7:00 AM a 11:00 AM.',
 'Carlos Mendoza', '921 098 765', 'c.mendoza@nestle.com',
 'Av. Nicolas Ayllon 4200, Ate Vitarte',
 -12.0289300, -76.9598700);

INSERT INTO detalle_pedido_mercancia (id_pedido, descripcion_mercancia, tipo_carga, cantidad_bultos, peso_subtotal_kg, requiere_camion_especial) VALUES
-- Pedido 1 (OC-ALC-2025-0341) — cadena de frío
(1, 'Productos lácteos refrigerados (yogur, queso, mantequilla)', 'REFRIGERADA', 192, 7750.00, 'REFRIGERADO'),
(1, 'Embutidos y carnes procesadas envasadas al vacío',           'REFRIGERADA', 128, 4750.00, 'REFRIGERADO'),
-- Pedido 2 (OC-GLO-2025-0892)
(2, 'Artículos de limpieza doméstica (detergentes, lejías)',      'GENERAL',     116, 4368.00, NULL),
(2, 'Productos de higiene personal (champús, jabones)',           'GENERAL',      94, 4032.00, NULL),
-- Pedido 3 (OC-BAC-2025-1123)
(3, 'Bebidas alcohólicas (cervezas, licores)',                    'GENERAL',     202, 7280.00, NULL),
(3, 'Golosinas y confitería surtida',                            'SECA',        135, 5096.00, NULL),
(3, 'Conservas y enlatados de alimentos',                        'SECA',        113, 5824.00, NULL),
-- Pedido 4 (OC-SAG-2025-0567)
(4, 'Cereales y harinas envasadas para consumo masivo',          'SECA',        108, 3074.00, NULL),
(4, 'Azúcar refinada en sacos de 50 kg',                        'SECA',         72, 2226.00, NULL),
-- Pedido 5 (OC-SPP-2025-0234)
(5, 'Snacks y alimentos empacados de consumo inmediato',         'SECA',        156, 5460.00, NULL),
(5, 'Aceites vegetales comestibles en bidones',                  'GENERAL',     136, 5928.00, NULL),
(5, 'Condimentos y aderezos embotellados',                      'GENERAL',      98, 4212.00, NULL),
-- Pedido 6 (OC-LIN-2025-0781)
(6, 'Productos de limpieza industrial a granel',                 'GENERAL',     130, 4900.00, NULL),
(6, 'Insumos de oficina y papelería',                           'SECA',        130, 4900.00, NULL),
-- Pedido 7 (OC-PYG-2025-0412) — cadena de frío
(7, 'Helados y postres congelados (paletas, tortas heladas)',    'REFRIGERADA',  91, 2520.00, 'REFRIGERADO'),
(7, 'Jugos y bebidas pasteurizadas refrigeradas',               'REFRIGERADA',  49, 1680.00, 'REFRIGERADO'),
-- Pedido 8 (OC-NES-2025-0658)
(8, 'Café molido y en grano envasado al vacío',                 'SECA',        120, 4180.00, NULL),
(8, 'Chocolates y productos cacaoteros',                        'SECA',        105, 3630.00, NULL),
(8, 'Leche evaporada y condensada en cajas',                   'GENERAL',      75, 3190.00, NULL),
-- Pedido 9 (OC-LAI-2025-0293)
(9, 'Productos cosméticos y cuidado personal (cremas, lociones)','GENERAL',     94, 3172.00, NULL),
(9, 'Artículos de higiene bucal (pastas, cepillos)',            'GENERAL',      76, 2928.00, NULL),
-- Pedido 10 (OC-TOT-2025-1045)
(10, 'Ropa y prendas de vestir empacadas',                      'SECA',        147, 4844.00, NULL),
(10, 'Calzado deportivo y casual encajonado',                   'SECA',        147, 5536.00, NULL),
(10, 'Accesorios textiles y complementos de moda',             'SECA',        126, 6920.00, NULL),
-- Pedido 11 (OC-ISM-2025-0374)
(11, 'Suplementos alimenticios y vitaminas envasadas',          'SECA',         98, 3456.00, NULL),
(11, 'Medicamentos OTC y productos de farmacia',                'SECA',         97, 3744.00, NULL),
-- Pedido 12 (OC-UNI-2025-0829) — líquidos, no apilar
(12, 'Bebidas carbonatadas en botellas plásticas',              'GENERAL',     127, 5162.00, NULL),
(12, 'Agua mineral y de mesa embotellada',                      'GENERAL',     103, 3738.00, NULL),
-- Pedido 13 (OC-TOT-2025-1102) — CANCELADO
(13, 'Electrodomésticos pequeños (licuadoras, tostadoras)',     'GENERAL',     155, 6050.00, NULL),
(13, 'Accesorios y repuestos para electrodomésticos',          'SECA',        155, 6050.00, NULL),
-- Pedido 14 (OC-ARC-2025-0516) — MATPEL
(14, 'Materiales de construcción (pinturas, selladores)',       'MATPEL',      192, 8190.00, 'MATPEL'),
(14, 'Adhesivos y solventes industriales',                      'MATPEL',      144, 6240.00, 'MATPEL'),
(14, 'Herramientas manuales y eléctricas empacadas',           'GENERAL',     144, 5070.00, NULL),
-- Pedido 15 (OC-BIM-2025-0187)
(15, 'Juguetes infantiles plásticos y didácticos',              'GENERAL',      90, 2640.00, NULL),
(15, 'Artículos deportivos y recreativos',                      'GENERAL',      60, 2160.00, NULL),
-- Pedido 16 (OC-ALC-2025-0388) — 2da entrega cadena de frío
(16, 'Productos lácteos refrigerados (quesos maduros, crema)', 'REFRIGERADA',  198, 8236.00, 'REFRIGERADO'),
(16, 'Fiambres y carnes frías envasadas',                      'REFRIGERADA',   90, 3408.00, 'REFRIGERADO'),
(16, 'Mantequillas y margarinas refrigeradas',                 'REFRIGERADA',   72, 2556.00, 'REFRIGERADO'),
-- Pedido 17 (OC-GLO-2025-0941) — verificar temperatura
(17, 'Jugos naturales pasteurizados refrigerados',             'REFRIGERADA',  100, 4056.00, 'REFRIGERADO'),
(17, 'Lácteos y bebidas a base de soya refrigeradas',         'REFRIGERADA',  100, 3744.00, 'REFRIGERADO'),
-- Pedido 18 (OC-SAG-2025-0601)
(18, 'Arroz y granos secos envasados en sacos',                'SECA',        151, 5562.00, NULL),
(18, 'Leguminosas secas (lentejas, frijoles, garbanzos)',      'SECA',        124, 4738.00, NULL),
-- Pedido 19 (OC-LIN-2025-0834) — carbonatadas
(19, 'Bebidas carbonatadas en latas de aluminio',              'GENERAL',     114, 4118.00, NULL),
(19, 'Agua tónica y energizantes embotellados',                'GENERAL',      76, 2982.00, NULL),
-- Pedido 20 (OC-NES-2025-0712) — Ate Vitarte
(20, 'Café instantáneo y bebidas en polvo envasadas',          'SECA',        153, 5628.00, NULL),
(20, 'Galletas, barras y snacks empacados',                    'SECA',        119, 4422.00, NULL),
(20, 'Sopas instantáneas y fideos en sobre',                   'SECA',         68, 3350.00, NULL);

-- ===========================================================================
-- MÓDULO 2: CÁMARA DISPOSITIVO (requerido como FK en registro_acceso)
-- ===========================================================================

INSERT INTO camara_dispositivo (codigo_ip, ubicacion_garita, estado_hardware) VALUES
('192.168.10.51', 'Garita Principal de Control Perimetral', 'OPERATIVO');


-- ===========================================================================
-- MÓDULO 3: VIAJES PROGRAMADOS (5 viajes - sin id_camion/id_conductor)
-- ===========================================================================

INSERT INTO viaje_programado (id_pedido, codigo_reserva_patio, tipo_operacion, fecha_hora_estimada, guia_remision_ransa, estado_viaje, programado_por_admin, fecha_limite_entrega, hora_recogida_inicio, hora_recogida_fin) VALUES
(1,  'RSV-2025-0041', 'DESPACHO',  '2025-05-13 06:00:00', 'GRR-2025-00341', 'CONFIRMADO',   1, '2025-05-13 14:00:00', '05:30', '06:30'), -- Viaje 1
(5,  'RSV-2025-0042', 'DESPACHO',  '2025-05-13 07:30:00', 'GRR-2025-00342', 'EN_TRANSITO',  2, '2025-05-13 16:00:00', '07:00', '08:00'), -- Viaje 2
(8,  'RSV-2025-0043', 'RECEPCION', '2025-05-13 09:00:00', 'GRR-2025-00343', 'PENDIENTE',    1, '2025-05-14 10:00:00', '08:30', '10:00'), -- Viaje 3
(14, 'RSV-2025-0044', 'DESPACHO',  '2025-05-14 05:30:00', 'GRR-2025-00344', 'CONFIRMADO',   4, '2025-05-14 13:00:00', '05:00', '06:00'), -- Viaje 4
(2,  'RSV-2025-0045', 'DESPACHO',  '2025-05-14 07:00:00', 'GRR-2025-00345', 'PENDIENTE',    2, '2025-05-14 11:00:00', '06:30', '07:30'), -- Viaje 5
(3,  'RSV-2025-0046', 'DESPACHO',  '2025-05-14 08:00:00', 'GRR-2025-00346', 'PENDIENTE',    1, '2025-05-14 16:00:00', '07:30', '08:30'), -- Viaje 6
(4,  'RSV-2025-0047', 'DESPACHO',  '2025-05-14 09:30:00', 'GRR-2025-00347', 'PENDIENTE',    4, '2025-05-14 17:00:00', '09:00', '10:00'), -- Viaje 7
(6,  'RSV-2025-0048', 'DESPACHO',  '2025-05-14 11:00:00', 'GRR-2025-00348', 'PENDIENTE',    2, '2025-05-14 19:00:00', '10:30', '11:30'), -- Viaje 8
(7,  'RSV-2025-0049', 'DESPACHO',  '2025-05-14 13:00:00', 'GRR-2025-00349', 'PENDIENTE',    1, '2025-05-14 21:00:00', '12:30', '13:30'), -- Viaje 9
(10, 'RSV-2025-0050', 'DESPACHO',  '2025-05-14 15:00:00', 'GRR-2025-00350', 'PENDIENTE',    4, '2025-05-14 23:00:00', '14:30', '15:30'); -- Viaje 10


-- Viaje 1 (Pedido 1 - Alicorp: 12,500 kg) -> Requiere 1 Camión Pesado
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(1, 1, 1);  -- F3I-845 (Volvo FH16) / Roberto Quispe Mamani

-- Viaje 2 (Pedido 5 - Supermercados Peruanos: 15,600 kg) -> Dividido en 2 Camiones Medianos
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(2, 5, 2),  -- H5T-423 (Ford Cargo 2429) / Juan Pablo Torres Ccahuana
(2, 12, 6); -- N3X-608 (Mercedes Atego 1725) / César Flores Aliaga

-- Viaje 3 (Pedido 8 - Nestlé: 11,000 kg) -> Requiere 1 Camión Pesado
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(3, 2, 7);  -- D7K-312 (Mercedes Actros 2545) / Wilson Rojas Tapia

-- Viaje 4 (Pedido 14 - Aceros: 19,500 kg) -> Dividido en 2 Camiones Pesados
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(4, 1, 1),   -- F3I-845 (Volvo FH16) / Roberto Quispe Mamani (Retorna e ingresa a nueva ruta)
(4, 10, 10); -- J2Q-867 (Volvo FM 370) / Héctor Medina Paucar

-- Viaje 5 (Pedido 2 - Gloria: 8,400 kg) -> Cubierto por 1 Camión Pesado/Medio
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(5, 3, 3);  -- C9P-671 (Scania R450) / Luis Enrique Huanca Apaza

-- Viaje 6 (Pedido 3 - Backus: 18,200 kg) -> Envío masivo de bebidas, requiere 1 Pesado de gran capacidad
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(6, 15, 8); -- R5U-723 (Volvo FMX 500 - 32 Tn) / Edgard Villanueva Cruz

-- Viaje 7 (Pedido 4 - Saga Falabella: 5,300 kg) -> Carga retail, se asigna Furgón Ligero
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(7, 7, 5);  -- E1W-789 (Isuzu NPR 400) / Marco Antonio Sánchez Rivas

-- Viaje 8 (Pedido 6 - Lindley: 9,800 kg) -> Despacho de bebidas, camión rígido mediano
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(8, 4, 11); -- A2M-190 (Volkswagen Constellation) / Franklin Asto Huallpa

-- Viaje 9 (Pedido 7 - Pepsico: 4,200 kg) -> Cadena de frío (Helados/Jugos), requiere Furgón con furgoneta operativa
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(9, 9, 12); -- K6L-512 (Mitsubishi Canter) / Néstor Gutiérrez Huamán

-- Viaje 10 (Pedido 10 - Tottus: 17,300 kg) -> Distribución masiva de supermercados, requiere un Convoy de 2 unidades
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(10, 10, 10), -- J2Q-867 (Volvo FM 370) / Héctor Medina Paucar
(10, 14, 14); -- Q1S-490 (Ford F-4000) / Dante Luján Portilla


-- ===========================================================================
-- MÓDULO 2: MANTENIMIENTO CAMION (10 registros históricos)
-- ===========================================================================

INSERT INTO mantenimiento_camion (id_camion, tipo_mantenimiento, fecha_mantenimiento, descripcion) VALUES
(1,  'PREVENTIVO',  '2025-02-10', 'Cambio de aceite y filtros. Revisión de frenos.'),
(2,  'CORRECTIVO',  '2025-01-25', 'Reparación de sistema hidráulico de dirección.'),
(3,  'PREVENTIVO',  '2025-03-05', 'Cambio de neumáticos delanteros y revisión general.'),
(6,  'CORRECTIVO',  '2025-04-18', 'Falla en sistema de refrigeración del motor. Reemplazo de termostato.'),
(6,  'PREVENTIVO',  '2025-05-01', 'Post-reparación: revisión completa antes de retorno a operación.'),
(4,  'PREVENTIVO',  '2025-02-28', 'Afinamiento general y cambio de batería.'),
(11, 'CORRECTIVO',  '2025-03-15', 'Accidente leve en patio. Reparación de parachoques y luces delanteras.'),
(7,  'PREVENTIVO',  '2025-01-12', 'Cambio de aceite, revisión de suspensión y frenos.'),
(10, 'PREVENTIVO',  '2025-04-02', 'Revisión de 50,000 km. Cambio de correa de distribución.'),
(14, 'CORRECTIVO',  '2025-05-08', 'Falla en caja de cambios. Unidad fuera de servicio 3 días.');


-- ===========================================================================
-- MÓDULO 4: CONTROL DE ACCESOS PERIMETRALES 
-- ===========================================================================

INSERT INTO registro_acceso (
    id_viaje, id_camion, id_conductor, id_camara, tipo_evento, 
    placa_detectada_alpr, confianza_alpr, url_foto_captura, timestamp_evento, 
    estado_deteccion, latencia_ms, nivel_iluminacion, nivel_obstruccion, 
    puerta_asignada, muelle_dock, estado_barrera, decision_acceso, revisado_por_admin
) VALUES
-- [ID_ACCESO 1] Despacho Exitoso de la mañana (Scania R450)
(4, 3, 3, 1, 'SALIDA', 'C9P-671', 98.50, '/img/capturas/alpr_c9p671_out.jpg', '2026-06-05 05:45:00', 'COMPLETADO', 120, 'INSUFICIENTE', 'NINGUNA', 1, 'A1', 'ABIERTO', 'AUTORIZADO', 1),

-- [ID_ACCESO 2] Despacho Exitoso (VW Constellation)
(5, 4, 5, 1, 'SALIDA', 'A2M-190', 99.10, '/img/capturas/alpr_a2m190_out.jpg', '2026-06-05 06:40:00', 'COMPLETADO', 95, 'NORMAL', 'NINGUNA', 1, 'A2', 'ABIERTO', 'AUTORIZADO', 1),

-- [ID_ACCESO 3] Despacho Exitoso (Isuzu NPR 400)
(6, 7, 8, 1, 'SALIDA', 'E1W-789', 97.80, '/img/capturas/alpr_e1w789_out.jpg', '2026-06-05 08:10:00', 'COMPLETADO', 140, 'NORMAL', 'NINGUNA', 2, 'B1', 'ABIERTO', 'AUTORIZADO', 4),

-- [ID_ACCESO 4] CASO DENEGADO: Conductor Pedro Callo no aprobó Charla de Inducción de Seguridad Obligatoria
(7, 6, 4, 1, 'SALIDA', 'B8R-056', 96.40, '/img/capturas/alpr_b8r056_rej.jpg', '2026-06-05 08:55:00', 'EN REVISION', 110, 'NORMAL', 'DETECTADA', 1, NULL, 'CERRADO', 'DENEGADO', 2),

-- [ID_ACCESO 5] Retorno Exitoso a Patio - Fin de Ruta del primer camión (Scania R450)
(4, 3, 3, 1, 'ENTRADA', 'C9P-671', 99.30, '/img/capturas/alpr_c9p671_in.jpg', '2026-06-05 11:30:00', 'COMPLETADO', 88, 'NORMAL', 'NINGUNA', 3, 'M1', 'ABIERTO', 'AUTORIZADO', 1),

-- [ID_ACCESO 6] Retorno Exitoso a Patio - Fin de Ruta (VW Constellation)
(5, 4, 5, 1, 'ENTRADA', 'A2M-190', 95.20, '/img/capturas/alpr_a2m190_in.jpg', '2026-06-05 14:15:00', 'COMPLETADO', 160, 'NORMAL', 'NINGUNA', 3, 'M2', 'ABIERTO', 'AUTORIZADO', 1),

-- [ID_ACCESO 7] CASO DENEGADO: Placa con lodo denso. El ALPR confunde el '4' por una 'A'. Requiere verificación manual
(8, 8, 9, 1, 'SALIDA', 'G4N-23A', 62.10, '/img/capturas/alpr_g4n234_err.jpg', '2026-06-05 09:40:00', 'ERROR EN LECTURA', 310, 'NORMAL', 'DETECTADA', 2, NULL, 'CERRADO', 'DENEGADO', 2),

-- [ID_ACCESO 8] Operación de la tarde: Salida Autorizada (Volvo FM 370)
(9, 10, 10, 1, 'SALIDA', 'J2Q-867', 98.90, '/img/capturas/alpr_j2q867_out.jpg', '2026-06-05 15:10:00', 'COMPLETADO', 105, 'NORMAL', 'NINGUNA', 1, 'C1', 'ABIERTO', 'AUTORIZADO', 1),

-- [ID_ACCESO 9] Salida Autorizada al finalizar la tarde (Ford F-4000)
(10, 14, 11, 1, 'SALIDA', 'Q1S-490', 97.40, '/img/capturas/alpr_q1s490_out.jpg', '2026-06-05 16:20:00', 'COMPLETADO', 115, 'NORMAL', 'NINGUNA', 1, 'C2', 'ABIERTO', 'AUTORIZADO', 4),

-- [ID_ACCESO 10] CASO DENEGADO: Intento de salida de camión bloqueado en el sistema por estado "INOPERATIVO"
(7, 11, 12, 1, 'ENTRADA', 'M9V-341', 99.50, '/img/capturas/alpr_m9v341_soat.jpg', '2026-06-06 06:10:00', 'EN REVISION', 90, 'INSUFICIENTE', 'NINGUNA', 2, NULL, 'CERRADO', 'DENEGADO', 2),

-- [ID_ACCESO 11] Siguiente día (06 de Junio): Despacho matutino Exitoso (Mercedes Atego)
(3, 12, 1, 1, 'ENTRADA', 'N3X-608', 98.20, '/img/capturas/alpr_n3x608_out.jpg', '2026-06-06 07:15:00', 'COMPLETADO', 122, 'NORMAL', 'NINGUNA', 1, 'D1', 'ABIERTO', 'AUTORIZADO', 4),

-- [ID_ACCESO 12] Despacho Exitoso (Isuzu ELF 150)
(9, 13, 2, 1, 'ENTRADA', 'P7Z-175', 96.90, '/img/capturas/alpr_p7z175_out.jpg', '2026-06-06 08:45:00', 'COMPLETADO', 145, 'NORMAL', 'NINGUNA', 2, 'D2', 'ABIERTO', 'AUTORIZADO', 1),

-- [ID_ACCESO 13] Salida de Carga Pesada Autorizada (Volvo FMX 500)
(6, 15, 6, 1, 'ENTRADA', 'R5U-723', 99.00, '/img/capturas/alpr_r5u723_out.jpg', '2026-06-06 10:40:00', 'COMPLETADO', 99, 'NORMAL', 'NINGUNA', 1, 'A1', 'ABIERTO', 'AUTORIZADO', 1),

-- [ID_ACCESO 14] Despacho Corporativo Exitoso (Volvo FH16)
(1, 1, 7, 1, 'SALIDA', 'F3I-845', 98.70, '/img/capturas/alpr_f3i845_out.jpg', '2026-06-06 11:15:00', 'COMPLETADO', 112, 'NORMAL', 'NINGUNA', 2, 'A2', 'ABIERTO', 'AUTORIZADO', 4),

-- [ID_ACCESO 15] Último despacho del turno de mañana (Mercedes Actros)
(2, 2, 14, 1, 'SALIDA', 'D7K-312', 97.30, '/img/capturas/alpr_d7k312_out.jpg', '2026-06-06 13:05:00', 'COMPLETADO', 130, 'NORMAL', 'NINGUNA', 1, 'B1', 'ABIERTO', 'AUTORIZADO', 1);


-- ===========================================================================
-- MÓDULO 4: ANOMALÍAS DE ACCESO 
-- ===========================================================================

INSERT INTO anomalia_acceso (id_acceso, tipo_anomalia, descripcion_detallada, autorizado_preventivo) VALUES
-- Asociado al id_acceso = 4 (Falta de capacitación del conductor lanzada en control perimetral)
(4, 'INDUCCION_SEGURIDAD_AUSENTE', 'El conductor Pedro Callo Condori figura en base de datos con la charla de inducción desaprobada/no realizada. Acceso denegado por políticas de SSO Ransa.', FALSE),

-- Asociado al id_acceso = 7 (Lectura incorrecta por obstrucción física de suciedad)
(7, 'LECTURA_FALLIDA_ALPR', 'La cámara ALPR procesó la cadena "G4N-23A" debido a acumulación crítica de barro sobre el último dígito (físico: G4N-234). Unidad retenida en bahía secundaria para limpieza de placa.', FALSE),

-- Asociado al id_acceso = 10 (Validación vehicular fallida por alertas lógicas de estado)
(10, 'VEHICULO_INOPERATIVO', 'El sistema detectó que el tracto Scania G410 (M9V-341) está marcado como INOPERATIVO en el módulo logístico. Bloqueo automático de barrera para evitar siniestros en ruta.', FALSE),

-- Alertas preventivas menores (Donde la barrera sí abrió por aprobación del Supervisor)
(1, 'CAMION_SUCIO', 'Placa legible con éxito, pero la estructura trasera del chasis registra salpicaduras severas de lodo andino.', TRUE),

(3, 'RESTRICCION_HORARIA_PROXIMA', 'La unidad E1W-789 inició salida con un desfase de 40 minutos sobre el rango estimado debido a demoras en el muelle de carga B1.', TRUE),

(8, 'FALLA_ILUMINACION_EXTERNA', 'Se observa intermitencia en el faro neblinero izquierdo del tracto camión durante la captura fotográfica del ALPR. Notificado a taller.', TRUE),

-- Nuevas anomalías reales registradas en Ransa
(11, 'MATRICULA_DESGASTADA', 'Placa delantera N3X-608 presenta pérdida notable de pintura reflectante en el borde inferior. El sistema logró identificarla, pero se sugiere cambio.', TRUE),

(12, 'DOCUMENTACION_SCTR_PROXIMO_VENCER', 'El conductor Juan Pablo Torres ingresa a ruta teniendo el SCTR activo solo por 48 horas más. Notificación de renovación prioritaria enviada a RRHH.', TRUE),

(13, 'SOAT_POR_VENCER', 'Alerta amarilla automatizada: El camión R5U-723 posee SOAT vigente solo hasta fin de mes. Alerta guardada en el planificador analítico.', TRUE);

