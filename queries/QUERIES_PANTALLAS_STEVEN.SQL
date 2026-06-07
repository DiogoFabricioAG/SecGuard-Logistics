-- Consulta de kpi
SELECT * FROM configuracion_kpi;


-- Consulta de verificiación de cambio de estado a inactivo KPI
SELECT * FROM configuracion_kpi WHERE estado_kpi = 'INACTIVO';
