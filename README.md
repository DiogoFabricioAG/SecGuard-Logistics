# SecGuard Logistics 🚛🔒

[![Status][badge-status]][link-status]
[![License][badge-license]][link-license]
[![Issues][badge-issues]][link-issues]
[![Pull Requests][badge-pr]][link-pr]

**SecGuard Logistics** es una plataforma SaaS basada en la nube que automatiza el control de acceso vehicular en centros de distribución mediante **reconocimiento de placas ALPR** (Automatic License Plate Recognition). Desarrollada para **RANSA** (líder logístico en Latinoamérica), optimiza eficiencia operativa, seguridad perimetral y trazabilidad de flota tercerizada.

## 🎯 Objetivos

### General

Desarrollar una plataforma cloud que automatice accesos vehiculares con ALPR, minimizando tiempos de espera y fortaleciendo seguridad en cadena de suministro.

### Específicos

- Procesamiento ininterrumpido de flujo vehicular (alta capacidad AWS).
- Gestión segura de datos (PostgreSQL + auditoría).
- Arquitectura modular para mantenimiento (Node.js/React/Vercel).

## 🏢 Contexto Empresarial

- **Cliente**: RANSA - Operador logístico extremo-a-extremo (almacenaje, transporte).
- **Problema**: Registros manuales en garitas causan cuellos de botella, errores humanos y brechas seguridad.
- **Solución**: Visión artificial + nube = Accesos en <2s, logs auditables, dashboard real-time.

## 🛠️ Stack Técnico

| Categoría        | Tecnologías                                      |
| ---------------- | ------------------------------------------------ |
| **Frontend**     | React, Vercel                                    |
| **Backend**      | Node.js, Express                                 |
| **Database**     | PostgreSQL                                       |
| **Cloud**        | AWS (S3, EC2, Cognito), Cloudflare               |
| **ALPR**         | OpenALPR Cloud API                               |
| **Herramientas** | GitHub Projects (SCRUM), UML/Draw.io, MS-Project |
| **Hardware**     | Cámaras IP, Edge Computing                       |

**Costo Total Estimado**: S/ 120,191 (primer año). **ROI**: +23% ingresos (S/ 280k beneficio).

## 📋 Estructura del Proyecto

```
SecGuard-Logistics/
├── docs/                 # Perfil PDF, diagramas UML/BPMN
├── src/
│   ├── frontend/         # React Dashboard
│   ├── backend/          # Node.js API + ALPR
│   └── infra/            # AWS Terraform/Docker
├── diagrams/             # Draw.io exports (Cap 2)
└── tests/
```

## 🚀 Roadmap (SCRUM Sprints)

1. **Sprint 0**: Análisis Sistemas (Cap 2) - **En Progreso**.
2. **Sprint 1**: Diseño + PoC ALPR.
3. **Sprint 2-4**: Desarrollo + Deploy AWS.
4. **Sprint 5**: Testing + RANSA Pilot.

## 👥 Equipo

| Miembro        |
| -------------- |
| Diogo Abregu   |
| Nicole Auqui   |
| Steven Cadillo |
| Nelson Carrera |
| José Venegas   |

## 📄 Licencia & Contacto

Proyecto académico/universitario (UNI - Ingeniería Software). Contacto: equipo5.seguard@gmail.com

---

_Desarrollado con ❤️ por Grupo 5 - Entrega: 10 Abril 2026_

[badge-status]: https://img.shields.io/badge/status-planning-blue
[badge-license]: https://img.shields.io/badge/license-MIT-green
[badge-issues]: https://img.shields.io/github/issues-raw/tu-user/SecGuard-Logistics
[badge-pr]: https://img.shields.io/github/issues-pr/tu-user/SecGuard-Logistics

---
