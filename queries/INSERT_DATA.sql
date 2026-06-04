-- ===========================================================================
-- SCRIPT DE INSERTS: SECGUARD LOGISTICS (RANSA)
-- AUTOR: DIOGO ABREGU
-- DESCRIPCIÓN: Datos de prueba realistas para el contexto peruano.
--              Cubre tablas base y las modificaciones acordadas.
-- ===========================================================================


-- ===========================================================================
-- MÓDULO 1: ADMINISTRADORES (requerido como FK base)
-- ===========================================================================

INSERT INTO administrador (nombres, apellidos, correo_electronico, nombre_usuario, contrasenia_hash, area_operativa, rol_usuario, estado_cuenta) VALUES
('Carlos Ernesto',   'Villalobos Quispe',   'c.villalobos@ransa.pe',   'cvillalobos',   '$2b$12$KLMxyz123abc', 'Operaciones',      'SUPERVISOR',     'ACTIVO'),
('María Fernanda',   'Salas Huanca',        'm.salas@ransa.pe',        'msalas',        '$2b$12$ABCdef456ghi', 'Seguridad',        'ADMINISTRADOR',  'ACTIVO'),
('Jorge Luis',       'Paredes Cárdenas',    'j.paredes@ransa.pe',      'jparedes',      '$2b$12$DEFghi789jkl', 'TI',               'SOPORTE',        'ACTIVO'),
('Lucía Beatriz',    'Ramírez Flores',      'l.ramirez@ransa.pe',      'lramirez',      '$2b$12$GHIjkl012mno', 'Operaciones',      'SUPERVISOR',     'ACTIVO'),
('Andrés Felipe',    'Chávez Mendoza',      'a.chavez@ransa.pe',       'achavez',       '$2b$12$JKLmno345pqr', 'Logística',        'ADMINISTRADOR',  'INACTIVO');


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

INSERT INTO conductor_ransa (dni, nombres, apellidos, nro_brevete, vigencia_sctr, charla_induccion_aprobada, estado_empleado) VALUES
('43218765', 'Roberto',   'Quispe Mamani',      'Q43218765-A3', '2026-03-15', TRUE,  'ACTIVO'),
('52341098', 'Juan Pablo', 'Torres Ccahuana',   'T52341098-A3', '2025-12-01', TRUE,  'ACTIVO'),
('38901234', 'Luis Enrique','Huanca Apaza',      'H38901234-A2', '2026-06-20', TRUE,  'ACTIVO'),
('71234567', 'Pedro',      'Callo Condori',     'C71234567-A3', '2025-09-10', FALSE, 'ACTIVO'),
('62345678', 'Marco Antonio','Sánchez Rivas',   'S62345678-A3', '2026-01-28', TRUE,  'ACTIVO'),
('48901267', 'César',      'Flores Aliaga',     'F48901267-A2', '2026-04-05', TRUE,  'ACTIVO'),
('55671234', 'Wilson',     'Rojas Tapia',       'R55671234-A3', '2025-11-14', TRUE,  'EN_RUTA'),
('67890123', 'Edgard',     'Villanueva Cruz',   'V67890123-A3', '2026-07-22', TRUE,  'ACTIVO'),
('34512678', 'Ángel',      'Paredes Bendezú',   'P34512678-A2', '2026-02-18', FALSE, 'ACTIVO'),
('79012356', 'Héctor',     'Medina Paucar',     'M79012356-A3', '2025-10-30', TRUE,  'ACTIVO'),
('41239087', 'Franklin',   'Asto Huallpa',      'A41239087-A3', '2026-05-11', TRUE,  'EN_RUTA'),
('58904321', 'Néstor',     'Gutiérrez Huamán',  'G58904321-A2', '2026-08-09', TRUE,  'ACTIVO'),
('66123490', 'Raúl',       'Cárdenas Zevallos', 'C66123490-A3', '2025-08-25', TRUE,  'DESCANSO'),
('72098345', 'Dante',      'Luján Portilla',    'L72098345-A3', '2026-03-03', TRUE,  'ACTIVO'),
('39087612', 'Wilmer',     'Sucari Condori',    'S39087612-A2', '2025-07-17', FALSE, 'INACTIVO');


-- ===========================================================================
-- MÓDULO 2: CAMIONES RANSA (15 camiones con nuevas columnas)
-- ===========================================================================

INSERT INTO camion_ransa (placa_matricula, modelo, capacidad_toneladas, tipo_unidad, vigencia_soat, vigencia_tarjeta_propiedad, estado_operativo, url_foto_vehiculo, clasificacion_peso, fecha_proximo_mantenimiento) VALUES
('F3I-845',  'Volvo FH16',          28.00, 'TRACTO_CAMION',    '2026-01-10', '2027-05-01', 'DISPONIBLE',    '/img/flota/F3I845.jpg',  'CARGA_PESADA',      '2025-08-15'),
('D7K-312',  'Mercedes Actros 2545',25.00, 'TRACTO_CAMION',    '2025-12-20', '2026-11-30', 'EN_RUTA',       '/img/flota/D7K312.jpg',  'CARGA_PESADA',      '2025-09-01'),
('C9P-671',  'Scania R450',         30.00, 'TRACTO_CAMION',    '2026-03-05', '2027-02-14', 'DISPONIBLE',    '/img/flota/C9P671.jpg',  'CARGA_PESADA',      '2025-10-20'),
('A2M-190',  'Volkswagen Constellation 24.280', 18.00, 'CAMION_RIGIDO', '2026-02-28', '2026-09-15', 'DISPONIBLE', '/img/flota/A2M190.jpg', 'CARGA_MEDIA', '2025-07-30'),
('H5T-423',  'Ford Cargo 2429',     14.00, 'CAMION_RIGIDO',    '2025-11-15', '2026-07-20', 'DISPONIBLE',    '/img/flota/H5T423.jpg',  'CARGA_MEDIA',       '2025-08-05'),
('B8R-056',  'Hino 500 Series',     12.00, 'CAMION_RIGIDO',    '2026-04-18', '2027-01-10', 'EN_MANTENIMIENTO','/img/flota/B8R056.jpg','CARGA_MEDIA',       '2025-06-28'),
('E1W-789',  'Isuzu NPR 400',        5.50, 'FURGON',           '2026-01-22', '2026-10-05', 'DISPONIBLE',    '/img/flota/E1W789.jpg',  'COMERCIAL_LIGERO',  '2025-09-12'),
('G4N-234',  'Toyota Dyna 300',      4.00, 'FURGON',           '2025-10-30', '2026-08-17', 'DISPONIBLE',    '/img/flota/G4N234.jpg',  'COMERCIAL_LIGERO',  '2025-07-25'),
('K6L-512',  'Mitsubishi Canter',    3.50, 'FURGON',           '2026-05-14', '2027-03-22', 'DISPONIBLE',    '/img/flota/K6L512.jpg',  'COMERCIAL_LIGERO',  '2025-10-01'),
('J2Q-867',  'Volvo FM 370',        22.00, 'TRACTO_CAMION',    '2026-02-09', '2026-12-28', 'DISPONIBLE',    '/img/flota/J2Q867.jpg',  'CARGA_PESADA',      '2025-11-05'),
('M9V-341',  'Scania G410',         26.00, 'TRACTO_CAMION',    '2025-09-25', '2027-04-10', 'INOPERATIVO',   '/img/flota/M9V341.jpg',  'CARGA_PESADA',      '2025-06-15'),
('N3X-608',  'Mercedes Atego 1725', 10.00, 'CAMION_RIGIDO',    '2026-06-01', '2026-11-08', 'DISPONIBLE',    '/img/flota/N3X608.jpg',  'CARGA_MEDIA',       '2025-08-22'),
('P7Z-175',  'Isuzu ELF 150',        2.50, 'FURGON',           '2026-03-17', '2027-06-30', 'DISPONIBLE',    '/img/flota/P7Z175.jpg',  'COMERCIAL_LIGERO',  '2025-09-18'),
('Q1S-490',  'Ford F-4000',          8.00, 'CAMION_RIGIDO',    '2025-08-12', '2026-06-25', 'EN_RUTA',       '/img/flota/Q1S490.jpg',  'CARGA_MEDIA',       '2025-10-10'),
('R5U-723',  'Volvo FMX 500',       32.00, 'TRACTO_CAMION',    '2026-04-28', '2027-07-15', 'DISPONIBLE',    '/img/flota/R5U723.jpg',  'CARGA_PESADA',      '2025-12-01');


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
(1,  'RSV-2025-0041', 'DESPACHO',  '2025-05-13 06:00:00', 'GRR-2025-00341', 'CONFIRMADO',   1, '2025-05-13 14:00:00', '05:30', '06:30'),
(5,  'RSV-2025-0042', 'DESPACHO',  '2025-05-13 07:30:00', 'GRR-2025-00342', 'EN_TRANSITO',  2, '2025-05-13 16:00:00', '07:00', '08:00'),
(8,  'RSV-2025-0043', 'RECEPCION', '2025-05-13 09:00:00', 'GRR-2025-00343', 'PENDIENTE',    1, '2025-05-14 10:00:00', '08:30', '10:00'),
(14, 'RSV-2025-0044', 'DESPACHO',  '2025-05-14 05:30:00', 'GRR-2025-00344', 'CONFIRMADO',   4, '2025-05-14 13:00:00', '05:00', '06:00'),
(20, 'RSV-2025-0045', 'DESPACHO',  '2025-05-14 07:00:00', 'GRR-2025-00345', 'PENDIENTE',    2, '2025-05-14 11:00:00', '06:30', '07:30');


-- ===========================================================================
-- MÓDULO 3: VIAJE CAMION ASIGNADO (múltiples camiones por viaje)
-- ===========================================================================

-- Viaje 1: pedido 12,500 kg → 1 camión pesado (28 tons) suficiente
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(1, 1, 1);  -- F3I-845 / Volvo FH16 / Roberto Quispe

-- Viaje 2: pedido 15,600 kg → 2 camiones medianos (14 + 12 tons = 26 tons)
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(2, 5,  2),  -- H5T-423 / Ford Cargo / Juan Torres
(2, 12, 6);  -- N3X-608 / Mercedes Atego / César Flores

-- Viaje 3: pedido 11,000 kg → 1 camión pesado (25 tons) suficiente
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(3, 2, 7);  -- D7K-312 / Mercedes Actros / Wilson Rojas

-- Viaje 4: pedido 19,500 kg → 2 camiones pesados (28 + 22 tons)
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(4, 1,  1),   -- F3I-845 / Volvo FH16 / Roberto Quispe
(4, 10, 10);  -- J2Q-867 / Volvo FM 370 / Héctor Medina

-- Viaje 5: pedido 13,400 kg → 1 camión pesado (30 tons) suficiente
INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor) VALUES
(5, 3, 3);  -- C9P-671 / Scania R450 / Luis Huanca


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