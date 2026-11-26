import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SeedConocimiento {
  titulo: string;
  categoria: string;
  contenido: string;
  urlGuia: string | null;
  fuente: string;
  esPublico: boolean;
}

const conocimientosSeed: SeedConocimiento[] = [
  // Artículos públicos (esPublico: true)
  {
    titulo: 'Quiénes somos — TokenService',
    categoria: 'Empresa',
    contenido:
      'TokenService es una consultora tecnológica ubicada en Lima, Perú, especializada en Soporte TI empresarial, infraestructura de redes, administración de servidores Linux y Windows, y ciberseguridad perimetral. Acompañamos a pymes y corporaciones garantizando continuidad operativa, tiempos de respuesta claros (SLA) y atención personalizada.',
    urlGuia: '/',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Infraestructura de Redes y Cableado Estructurado',
    categoria: 'Servicios',
    contenido:
      'Diseñamos, implementamos y mantenemos redes corporativas de alto rendimiento: cableado estructurado certificado Cat6/Cat6A, configuración de switches administrables, VLANs, enlaces Wi-Fi empresariales de alta densidad y ordenamiento profesional de racks de comunicaciones.',
    urlGuia: '/servicios',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Administración de Servidores Linux/Windows y Backups',
    categoria: 'Servicios',
    contenido:
      'Gestionamos servidores físicos y virtuales (Windows Server, Ubuntu, Debian, Proxmox y VMware), Active Directory, políticas de grupo, automatización de respaldos locales y en la nube (regla 3-2-1), así como planes de recuperación ante desastres.',
    urlGuia: '/servicios',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Ciberseguridad Perimetral, Firewalls y Auditoría Básica',
    categoria: 'Servicios',
    contenido:
      'Protegemos el perímetro y los endpoints de su organización mediante implementación y administración de firewalls empresariales (Fortinet, MikroTik, pfSense), VPNs seguras para trabajo remoto, protección anti-ransomware y auditorías básicas de vulnerabilidades y buenas prácticas.',
    urlGuia: '/servicios',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Plan Básico de Mantenimiento TI',
    categoria: 'Planes',
    contenido:
      'El Plan Básico está diseñado para pequeñas oficinas de hasta 10 equipos. Incluye soporte técnico remoto de lunes a viernes en horario de oficina, mantenimiento preventivo programado, monitoreo básico de salud de equipos y un SLA de respuesta de 8 horas hábiles. Inversión mensual: S/ 650/mes (no incluye IGV).',
    urlGuia: '/planes',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Plan Pyme de Soporte y Gestión TI',
    categoria: 'Planes',
    contenido:
      'El Plan Pyme cubre empresas en crecimiento de hasta 30 equipos. Incluye soporte técnico remoto prioritario, 2 visitas técnicas presenciales al mes en Lima Metropolitana, gestión de copias de seguridad, soporte a servidores básicos y un SLA de respuesta de 4 horas hábiles. Inversión mensual: S/ 1,450/mes (no incluye IGV).',
    urlGuia: '/planes',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Plan Corporativo 24/7',
    categoria: 'Planes',
    contenido:
      'El Plan Corporativo está orientado a operaciones críticas con equipos ilimitados. Ofrece monitoreo proactivo 24/7 de infraestructura y servidores, mesa de ayuda dedicada, visitas presenciales ilimitadas según cronograma, gestión de ciberseguridad y un SLA de respuesta de 1 hora. Precio a medida según alcance y sedes.',
    urlGuia: '/planes',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Horarios de Atención, Tickets de Soporte y WhatsApp',
    categoria: 'Soporte',
    contenido:
      'Nuestro horario regular de atención es de lunes a viernes de 8:30 a.m. a 6:30 p.m. y sábados de 9:00 a.m. a 1:00 p.m. (clientes del Plan Corporativo cuentan con guardia 24/7). Para reportar incidencias o solicitar asistencia técnica, puede registrar un ticket en nuestra sección de Soporte o escribirnos directamente por WhatsApp.',
    urlGuia: '/soporte',
    fuente: 'manual',
    esPublico: true,
  },
  {
    titulo: 'Solicitud de Presupuestos y Cotizaciones Personalizadas',
    categoria: 'Planes',
    contenido:
      'Si requiere un proyecto puntual de cableado, migración de servidores, auditoría de seguridad o un plan corporativo a medida, puede solicitar una cotización personalizada desde nuestro formulario en /cotizar. Un especialista evaluará sus requerimientos y enviará una propuesta formal en menos de 24 horas hábiles.',
    urlGuia: '/cotizar',
    fuente: 'manual',
    esPublico: true,
  },

  // Artículos confidenciales (esPublico: false) — NUNCA deben enviarse al LLM
  {
    titulo: 'Lista interna de clientes VIP y contratos',
    categoria: 'Confidencial',
    contenido:
      'DOCUMENTO ESTRICTAMENTE CONFIDENCIAL. Clientes VIP activos: Banco Andino (contrato anual #BA-2025 por S/ 480,000), Minera del Sur S.A. (contrato #MS-2025 por S/ 320,000). Margen neto interno objetivo de TokenService: 42%. Descuento máximo autorizado por gerencia comercial: 12% solo bajo firma directa.',
    urlGuia: null,
    fuente: 'manual',
    esPublico: false,
  },
  {
    titulo: 'Credenciales y arquitectura interna del servidor',
    categoria: 'Confidencial',
    contenido:
      'DOCUMENTO ESTRICTAMENTE CONFIDENCIAL. Servidor PostgreSQL interno desplegado en nodo privado IP de gestión 10.20.30.40 puerto 5432. Panel administrativo interno accesible únicamente para personal autorizado en rutas /admin/* con tokens JWT firmados. Respaldo maestro almacenado en NAS interno 10.20.30.55.',
    urlGuia: null,
    fuente: 'manual',
    esPublico: false,
  },
];

const reglasSeed: string[] = [
  'No ofrecer descuentos no autorizados; derivar cualquier negociación de precios a /cotizar.',
  'No brindar soporte técnico paso a paso ni comandos de reparación gratuita por el chat; invitar al usuario a abrir un ticket en /soporte.',
  'No opinar ni hacer comparaciones con otras empresas competidoras de TI.',
  'Responder siempre en español, de forma clara, profesional y en máximo 2 párrafos cortos.',
];

async function main(): Promise<void> {
  console.log('Iniciando carga de datos semilla (seed) de TokenService...');

  // 1. Usuario Administrador (idempotente por email único)
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.usuarioAdmin.upsert({
    where: { email: 'admin@tokenservice.com' },
    update: {
      nombre: 'Administrador TokenService',
    },
    create: {
      nombre: 'Administrador TokenService',
      email: 'admin@tokenservice.com',
      password: passwordHash,
    },
  });
  console.log(`- Usuario admin listo: ${admin.email} (ID: ${admin.id})`);

  // 2. Artículos de Conocimiento (públicos y confidenciales, idempotentes por título)
  let conocimientosCreados = 0;
  let conocimientosExistentes = 0;

  for (const item of conocimientosSeed) {
    const existente = await prisma.conocimiento.findFirst({
      where: { titulo: item.titulo },
    });

    if (!existente) {
      await prisma.conocimiento.create({ data: item });
      conocimientosCreados++;
    } else {
      conocimientosExistentes++;
    }
  }
  console.log(
    `- Conocimiento procesado: ${conocimientosCreados} creados, ${conocimientosExistentes} ya existentes (total seed: ${conocimientosSeed.length}).`
  );

  // 3. Reglas de Restricción (idempotentes por descripción)
  let reglasCreadas = 0;
  let reglasExistentes = 0;

  for (const descripcion of reglasSeed) {
    const existente = await prisma.reglaRestriccion.findFirst({
      where: { descripcion },
    });

    if (!existente) {
      await prisma.reglaRestriccion.create({
        data: {
          descripcion,
          activa: true,
        },
      });
      reglasCreadas++;
    } else {
      reglasExistentes++;
    }
  }
  console.log(
    `- Reglas de restricción procesadas: ${reglasCreadas} creadas, ${reglasExistentes} ya existentes (total seed: ${reglasSeed.length}).`
  );

  console.log('Seed completado correctamente.');
}

main()
  .catch((error) => {
    console.error('Error al ejecutar el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
