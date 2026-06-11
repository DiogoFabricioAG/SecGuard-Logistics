require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const camionesRoutes = require('./modules/flota/camiones.routes');
const viajesRoutes = require('./modules/flota/viajes.routes');
const pedidosRoutes = require('./modules/flota/pedidos.routes');
const accesosRoutes = require('./modules/accesos/accesos.routes');
const monitoreoRoutes = require('./modules/monitoreo/monitoreo.routes');
const kpiRoutes = require('./modules/kpi/kpi.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'SecGuard Logistics API v1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/flota/camiones', camionesRoutes);
app.use('/api/flota/viajes', viajesRoutes);
app.use('/api/flota/pedidos', pedidosRoutes);
app.use('/api/accesos', accesosRoutes);
app.use('/api/monitoreo', monitoreoRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`SecGuard Logistics API corriendo en puerto ${PORT}`);
});

module.exports = app;
