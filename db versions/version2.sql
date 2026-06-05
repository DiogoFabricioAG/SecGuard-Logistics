-- AUTOR: NELSON CARRERA

-- DESCRIPCIÓN: MODIIFCACIÓN DE COLUMNAS YA SEA EL TIPO DE DATO O NUEVO CAMPOS EN RESPCTIVAS TABLAS

-- MODIFICACIÓN EN 'registro_acceso'
ALTER TABLE registro_acceso
    ADD COLUMN estado_deteccion      VARCHAR(20), 
    ADD COLUMN latencia_ms           INT,          
    ADD COLUMN nivel_iluminacion     VARCHAR(20), 
    ADD COLUMN nivel_obstruccion     VARCHAR(20); 
    ADD COLUMN prioridad_envio       VARCHAR(50);

-- MODIFICACIÓN EN 'conductor_ransa'
ALTER TABLE conductor_ransa 
  ADD COLUMN empresa_transportista     VARCHAR(150)

-- MODIFICACIÓN EN 'camion_ransa'
ALTER TABLE camion_ransa          
  ADD COLUMN observaciones      TEXT

-- MODIFICACIÓN EN 'detalle_pedido_mercancia'
ALTER TABLE detalle_pedido_mercancia
  ADD COLUMN tipo_mercancia     VARCHAR(20)


