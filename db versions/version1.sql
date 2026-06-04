-- AUTOR: DIOGO ABREGU

-- DESCRIPCIÓN: ELIMINAR LAS COLUMNAS DE ID_CAMION Y ID_CONDUCTOR DE LA TABLA VIAJE_PROGRAMADO, 
-- + YA QUE UN VIAJE PUEDE TENER ASIGNADOS VARIOS CAMIONES Y CONDUCTORES.
-- + AGREGAR NUEVAS COLUMNAS PARA FECHA LÍMITE DE ENTREGA Y HORARIOS DE RECOGIDA.
-- + AGREGAMOS DESCRIPCIÓN DE RESTRICCIONES EN PEDIDO_CLIENTE PARA MEJORAR LA GESTIÓN DE PEDIDOS.

-- 1. Quitar las columnas de camion_ransa y conductor_ransa de viaje_programado
ALTER TABLE viaje_programado
DROP COLUMN id_camion,
DROP COLUMN id_conductor,
ADD COLUMN fecha_limite_entrega TIMESTAMP,
ADD COLUMN hora_recogida_inicio TIME,
ADD COLUMN hora_recogida_fin TIME;

-- 2. Tabla intermedia que permite N camiones por viaje
CREATE TABLE viaje_camion_asignado (
    id_asignacion SERIAL PRIMARY KEY,
    id_viaje INT NOT NULL,
    id_camion INT NOT NULL,
    id_conductor INT NOT NULL,
    CONSTRAINT fk_asig_viaje FOREIGN KEY (id_viaje) REFERENCES viaje_programado(id_viaje),
    CONSTRAINT fk_asig_camion FOREIGN KEY (id_camion) REFERENCES camion_ransa(id_camion),
    CONSTRAINT fk_asig_conductor FOREIGN KEY (id_conductor) REFERENCES conductor_ransa(id_conductor)
);

ALTER TABLE pedido_cliente
ADD COLUMN descripcion_restricciones TEXT;
    ADD COLUMN contacto_nombre    VARCHAR(100),
    ADD COLUMN contacto_telefono  VARCHAR(15),
    ADD COLUMN contacto_correo    VARCHAR(150),
    ADD COLUMN direccion_entrega  VARCHAR(255),   -- texto legible: "Av. Los Alamos 234, Ate Vitarte"
    ADD COLUMN latitud            DECIMAL(10, 7), -- ej: -12.0431800
    ADD COLUMN longitud           DECIMAL(10, 7); -- ej: -77.0282400