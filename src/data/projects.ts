export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'enterprise' | 'mobile' | 'backend' | 'infrastructure';
  role: { es: string; en: string };
  organization: string;
  period: string;
  featured: boolean;
  orbitIndex: number;
  stack: string[];
  summary: { es: string; en: string };
  challenge: { es: string; en: string };
  solution: { es: string; en: string };
  achievements: { es: string[]; en: string[] };
  architecture: {
    nodes: { id: string; label: string; type: 'client' | 'gateway' | 'service' | 'storage' | 'security' }[];
    connections: { from: string; to: string; label?: string }[];
  };
  metrics?: { label: { es: string; en: string }; value: string }[];
  links?: { github?: string; live?: string; docs?: string };
}

export const projectsData: ProjectItem[] = [
  {
    id: 'gran-via-sur',
    slug: 'gran-via-sur-nkoit',
    title: 'Gran Vía Sur / NKOIT',
    subtitle: 'High-Concurrency Headless ERP & Multi-Tenant Commerce Architecture',
    category: 'enterprise',
    role: {
      es: 'Arquitecto e Integrador de Sistemas Empresariales',
      en: 'Enterprise Systems Architect & Integrator',
    },
    organization: 'Plaza Gran Vía Sur / NKOIT',
    period: '2024 - Presente',
    featured: true,
    orbitIndex: 1,
    stack: ['Odoo 19', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'React', 'Vite', 'JSON-RPC', 'Redis', 'Cloudflare Zero Trust'],
    summary: {
      es: 'Diseño e integración de ecosistema tecnológico de alta concurrencia para administración comercial y condominal, enlazando interfaces reactivas con el núcleo ERP Odoo 19 mediante middleware tipado en tiempo real.',
      en: 'Architectural design and integration of a high-concurrency commercial property ecosystem, bridging reactive client interfaces with the enterprise Odoo 19 ERP core via real-time typed middleware.',
    },
    challenge: {
      es: 'El ERP Odoo debía operar como un almacén transaccional seguro y estricto sin exponer sus vistas nativas directamente a internet pública, manteniendo una latencia ultrabaja para cientos de consultas simultáneas de locales y leads.',
      en: 'The Odoo ERP had to act strictly as an audited transactional data core without exposing its native UI to public internet, while maintaining ultra-low latency for concurrent unit queries and commercial leads.',
    },
    solution: {
      es: 'Implementación de un gateway en Node.js que orquesta peticiones JSON-RPC cacheadas en Redis, protegido bajo un perímetro perimetral Cloudflare Zero Trust y alimentando un dashboard administrativo desacoplado en React/Vite.',
      en: 'Engineered a Node.js gateway orchestrating authenticated JSON-RPC requests cached in Redis, protected behind a strict Cloudflare Zero Trust perimeter and driving a decoupled React/Vite dashboard.',
    },
    achievements: {
      es: [
        'Arquitectura híbrida desacoplada entre frontend reactivo y núcleo ERP.',
        'Sincronización en tiempo real de leads comerciales y estado de locales mediante Redis y JSON-RPC.',
        'Sistema multi-tenant para gestión automatizada de cargos, pagos y conciliación de facturas.',
        'Arquitectura perimetral Zero Trust con Cloudflare Access y tokens criptográficos.',
      ],
      en: [
        'Decoupled hybrid architecture bridging reactive client interfaces and enterprise ERP core.',
        'Real-time synchronization of commercial leads and unit availability using Redis and JSON-RPC.',
        'Multi-tenant subsystem for automated charges, payments, and billing ledger reconciliation.',
        'Zero Trust security perimeter enforcement with Cloudflare Access and cryptographic verification.',
      ],
    },
    architecture: {
      nodes: [
        { id: 'client', label: 'React / Vite Admin UI', type: 'client' },
        { id: 'zt', label: 'Cloudflare Zero Trust Gateway', type: 'security' },
        { id: 'gateway', label: 'Node.js Express Proxy', type: 'gateway' },
        { id: 'redis', label: 'Redis Pub/Sub Cache', type: 'service' },
        { id: 'odoo', label: 'Odoo 19 ERP Core', type: 'service' },
        { id: 'db', label: 'PostgreSQL / Prisma Database', type: 'storage' },
      ],
      connections: [
        { from: 'client', to: 'zt', label: 'HTTPS / TLS 1.3' },
        { from: 'zt', to: 'gateway', label: 'Authenticated Proxy' },
        { from: 'gateway', to: 'redis', label: 'Cache Lookup' },
        { from: 'gateway', to: 'odoo', label: 'JSON-RPC' },
        { from: 'odoo', to: 'db', label: 'ACID Transactions' },
      ],
    },
    metrics: [
      { label: { es: 'Tiempo de Respuesta', en: 'Response Time' }, value: '< 85ms' },
      { label: { es: 'Reducción de Carga ERP', en: 'ERP Load Reduction' }, value: '-65%' },
      { label: { es: 'Disponibilidad', en: 'Uptime' }, value: '99.9%' },
    ],
  },
  {
    id: 'grupo-saom-cas',
    slug: 'grupo-saom-cas',
    title: 'Grupo SAOM / Proyecto CAS',
    subtitle: 'Field Workforce Modernization & Mobile Verification Engine',
    category: 'mobile',
    role: {
      es: 'Desarrollador de Software Móvil / Web',
      en: 'Mobile & Web Software Developer',
    },
    organization: 'Grupo SAOM',
    period: '2023 - 2024',
    featured: true,
    orbitIndex: 2,
    stack: ['Vue 3', 'Vite', 'Tailwind CSS', 'PHP', 'Yii 1.1', 'Google Maps API', 'HTML5 Canvas Signature'],
    summary: {
      es: 'Modernización y digitalización total de la operación técnica en campo para brigadas de mantenimiento, sustituyendo bitácoras físicas de papel por una plataforma web móvil asistida por geolocalización y cierre digital con firma.',
      en: 'End-to-end modernization and digitalization of field technical crew operations, replacing physical paper logs with a location-aware mobile web platform featuring cryptographic digital signature sign-off.',
    },
    challenge: {
      es: 'Las brigadas operaban con órdenes impresas, provocando demoras de hasta 48 horas en la captura de reportes, pérdida de trazabilidad física y falta de validación inmediata por parte del cliente en sitio.',
      en: 'Field technicians operated on printed work orders, causing 48-hour delays in maintenance logging, physical audit trail loss, and lack of immediate customer sign-off verification.',
    },
    solution: {
      es: 'Diseño de interfaz PWA móvil ultraliviana con validación offline/online, mapas de ruta, formularios de inspección técnica estructurados y módulo de firma digital con sellado temporal para auditoría.',
      en: 'Engineered an ultra-responsive mobile PWA interface with offline-first form capture, route dispatch mapping, and a canvas-based digital signature certification module.',
    },
    achievements: {
      es: [
        'Digitalización integral del flujo operativo y bitácoras para técnicos en campo.',
        'Calendarios dinámicos de asignaciones y despacho de órdenes de mantenimiento en tiempo real.',
        'Módulo centralizado de gestión documental y expedientes técnicos de equipos.',
        'Captura de firma digital sobre pantalla táctil para certificación inmediata del cliente.',
      ],
      en: [
        'Complete end-to-end digitalization of field technician operational workflows and incident logs.',
        'Dynamic scheduling calendars and real-time maintenance dispatch coordination.',
        'Centralized documentation repository and technical audit trails for client assets.',
        'Touchscreen digital signature capture pipeline for instant on-site intervention certification.',
      ],
    },
    architecture: {
      nodes: [
        { id: 'mobile', label: 'Vue 3 Field Mobile PWA', type: 'client' },
        { id: 'maps', label: 'Google Maps Dispatch Engine', type: 'service' },
        { id: 'api', label: 'PHP REST API Backend', type: 'gateway' },
        { id: 'vault', label: 'Digital Signature & PDF Vault', type: 'storage' },
        { id: 'db', label: 'MySQL Relational Store', type: 'storage' },
      ],
      connections: [
        { from: 'mobile', to: 'maps', label: 'Location Tracking' },
        { from: 'mobile', to: 'api', label: 'Encrypted Sync' },
        { from: 'api', to: 'vault', label: 'Sign-off Storage' },
        { from: 'api', to: 'db', label: 'Work Orders' },
      ],
    },
    metrics: [
      { label: { es: 'Tiempo de Cierre de Servicio', en: 'Service Closure Time' }, value: 'Inmediato (0h)' },
      { label: { es: 'Ahorro de Papel Operativo', en: 'Paperless Transition' }, value: '100%' },
      { label: { es: 'Tasa de Verificación', en: 'Client Verification Rate' }, value: '99.4%' },
    ],
  },
  {
    id: 'dreaming-flowers',
    slug: 'dreaming-flowers',
    title: 'Dreaming Flowers E-Commerce API',
    subtitle: 'Secure Transactional REST Backend & Catalog Engine',
    category: 'backend',
    role: {
      es: 'Desarrollador Backend',
      en: 'Backend Developer',
    },
    organization: 'Proyecto Tecnológico',
    period: '2023',
    featured: false,
    orbitIndex: 3,
    stack: ['Express', 'Node.js', 'MySQL', 'JWT', 'Multer', 'Swagger / OpenAPI'],
    summary: {
      es: 'Arquitectura backend robusta para catálogo y comercio electrónico floral, con autenticación sin estado mediante tokens JWT, manejo seguro de medios con Multer y documentación formal interactiva Swagger.',
      en: 'Robust backend architecture for floral e-commerce catalog operations, featuring stateless JWT token security, secure media intake via Multer, and formal interactive Swagger API documentation.',
    },
    challenge: {
      es: 'Garantizar la protección de rutas administrativas, validación estricta de esquemas de entrada y carga optimizada de activos multimedia sin degradar el rendimiento del servidor de base de datos.',
      en: 'Ensuring bulletproof admin route protection, strict payload schema validation, and optimized multimedia streaming without bottlenecking the database server.',
    },
    solution: {
      es: 'API estructurada en capas (Controller-Service-Repository), middlewares de autorización basados en roles y documentación viva con Swagger.',
      en: 'Layered architectural separation (Controller-Service-Repository), role-based middleware guards, and living Swagger OpenAPI documentation.',
    },
    achievements: {
      es: [
        'Autenticación JWT con rotación y control de sesiones por rol.',
        'Canal de ingesta y validación de imágenes con Multer y filtrado MIME.',
        'Documentación OpenAPI interactiva para integración rápida de clientes frontend.',
      ],
      en: [
        'JWT authentication with role-based claim authorization and session revocation.',
        'Secure image ingestion pipeline with Multer and MIME-type integrity checks.',
        'Interactive OpenAPI/Swagger documentation for friction-free client consumption.',
      ],
    },
    architecture: {
      nodes: [
        { id: 'client', label: 'E-Commerce Frontend', type: 'client' },
        { id: 'api', label: 'Express REST Framework', type: 'gateway' },
        { id: 'jwt', label: 'JWT Auth Middleware', type: 'security' },
        { id: 'media', label: 'Multer Storage Layer', type: 'storage' },
        { id: 'db', label: 'MySQL Relational Database', type: 'storage' },
      ],
      connections: [
        { from: 'client', to: 'jwt', label: 'Bearer Token' },
        { from: 'jwt', to: 'api', label: 'Authorized Request' },
        { from: 'api', to: 'media', label: 'File Upload' },
        { from: 'api', to: 'db', label: 'SQL Query' },
      ],
    },
  },
  {
    id: 'edutrack',
    slug: 'edutrack',
    title: 'EduTrack Mobile',
    subtitle: 'Offline-Resilient Academic Attendance & Grade Tracking',
    category: 'mobile',
    role: {
      es: 'Desarrollador Móvil Flutter',
      en: 'Flutter Mobile Developer',
    },
    organization: 'Proyecto Tecnológico',
    period: '2023 - 2024',
    featured: false,
    orbitIndex: 4,
    stack: ['Flutter', 'Dart', 'Node.js', 'MySQL', 'SharedPreferences', 'REST API'],
    summary: {
      es: 'Aplicación móvil multiplataforma desarrollada en Flutter para el seguimiento de asistencias, métricas de rendimiento y expedientes de estudiantes, equipada con persistencia local resistente a fallos de red.',
      en: 'Cross-platform mobile application engineered in Flutter for student attendance tracking, academic grading, and student records, equipped with network-resilient offline persistence.',
    },
    challenge: {
      es: 'Permitir a los docentes registrar listas y evaluaciones en aulas con conectividad Wi-Fi inestable o nula, garantizando sincronización bidireccional consistente al recuperar la conexión.',
      en: 'Enabling educators to record attendance and assessments in classrooms with unstable or zero Wi-Fi connectivity, guaranteeing conflict-free two-way data sync upon reconnection.',
    },
    solution: {
      es: 'Arquitectura reactiva en Dart con almacenamiento en SharedPreferences / SQLite local y una cola de peticiones en segundo plano que se sincroniza con el backend Node.js.',
      en: 'Reactive Dart architecture with local caching via SharedPreferences and an asynchronous synchronization queue interfacing with the Node.js backend.',
    },
    achievements: {
      es: [
        'Experiencia móvil nativa de 60 FPS con diseño UI adaptativo.',
        'Mecanismo de cola de sincronización sin pérdida de datos en zonas sin señal.',
        'Exportación rápida de reportes de asistencia en formatos estandarizados.',
      ],
      en: [
        'Fluid 60 FPS native mobile experience with adaptive interface design.',
        'Zero-data-loss synchronization queue for offline classroom environments.',
        'Instant attendance report aggregation and standardized export.',
      ],
    },
    architecture: {
      nodes: [
        { id: 'flutter', label: 'Flutter Mobile App', type: 'client' },
        { id: 'cache', label: 'SharedPreferences Local Store', type: 'storage' },
        { id: 'api', label: 'Node.js REST API', type: 'gateway' },
        { id: 'db', label: 'MySQL Academic Core', type: 'storage' },
      ],
      connections: [
        { from: 'flutter', to: 'cache', label: 'Instant Local Write' },
        { from: 'cache', to: 'api', label: 'Async Sync Queue' },
        { from: 'api', to: 'db', label: 'Persistent Records' },
      ],
    },
  },
  {
    id: 'redferee',
    slug: 'redferee',
    title: 'RedFeree Sports League Manager',
    subtitle: 'Sports Officiating Assignment & Disciplinary Ledger',
    category: 'enterprise',
    role: {
      es: 'Desarrollador Full Stack',
      en: 'Full Stack Developer',
    },
    organization: 'Proyecto Tecnológico',
    period: '2023',
    featured: false,
    orbitIndex: 5,
    stack: ['React', 'Vite', 'Supabase', 'Tailwind CSS', 'PostgreSQL', 'PokeAPI / Sports API'],
    summary: {
      es: 'Plataforma interactiva para la asignación arbitral, control de sanciones disciplinarias y conciliación de pagos para torneos deportivos y ligas competitivas.',
      en: 'Interactive web platform for referee match assignment, disciplinary sanction audit trails, and automated referee honorarium reconciliation for competitive leagues.',
    },
    challenge: {
      es: 'La designación de árbitros sufría colisiones de horarios constantes y la dispersión de cédulas arbitrales impedía calcular sanciones y liquidaciones con precisión.',
      en: 'Match officiating suffered from frequent schedule overlaps and fragmented incident reports prevented accurate disciplinary fines and referee payroll calculations.',
    },
    solution: {
      es: 'Plataforma centralizada con autenticación Supabase, suscripciones en tiempo real para actualización de partidos y lógica de liquidación automatizada por encuentro.',
      en: 'Centralized portal powered by Supabase authentication, real-time database subscriptions for live match events, and automated fee reconciliation logic.',
    },
    achievements: {
      es: [
        'Cédulas arbitrales digitales con carga inmediata de incidentes y tarjetas.',
        'Prevención algorítmica de conflictos de horario por categoría y juez.',
        'Cálculo automático de liquidaciones y balance financiero de la liga.',
      ],
      en: [
        'Digital match scorecards with real-time card and violation logging.',
        'Algorithmic referee collision prevention based on categories and availability.',
        'Automated payout calculation and league financial balance tracking.',
      ],
    },
    architecture: {
      nodes: [
        { id: 'ui', label: 'React / Vite Admin & Referee Portal', type: 'client' },
        { id: 'auth', label: 'Supabase Auth & RLS', type: 'security' },
        { id: 'db', label: 'Supabase PostgreSQL (Realtime)', type: 'storage' },
      ],
      connections: [
        { from: 'ui', to: 'auth', label: 'JWT Session' },
        { from: 'auth', to: 'db', label: 'Row Level Security' },
        { from: 'db', to: 'ui', label: 'WebSocket Updates' },
      ],
    },
  },
  {
    id: 'pos-preview',
    slug: 'pos-preview',
    title: 'POS Preview Engine',
    subtitle: 'Ultra-Fast Point of Sale & Terminal Prototype',
    category: 'mobile',
    role: {
      es: 'Desarrollador de Interfaces & Lógica POS',
      en: 'POS Interface & Logic Developer',
    },
    organization: 'Proyecto Tecnológico',
    period: '2024',
    featured: false,
    orbitIndex: 6,
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Web Audio API', 'LocalStorage / IndexedDB'],
    summary: {
      es: 'Prototipo interactivo de alta velocidad para terminales punto de venta (POS), optimizado para entrada táctil ultrarrápida, escaneo de códigos de barra y arqueo de caja con respuesta háptica y acústica.',
      en: 'High-velocity interactive Point of Sale (POS) terminal prototype, engineered for lightning-fast touch input, barcode scanning workflows, and instant cash register balancing with acoustic feedback.',
    },
    challenge: {
      es: 'En entornos de cobro intensivo, cualquier retraso de milisegundos en la interfaz ralentiza la fila de clientes y produce errores humanos en el ingreso de montos.',
      en: 'In high-throughput retail checkout, interface lag compounds customer wait times and introduces manual input cashier errors.',
    },
    solution: {
      es: 'Arquitectura de teclado numérico virtual reactivo, catálogo indexado en memoria con IndexedDB y atajos de teclado para operaciones en menos de 3 clics.',
      en: 'Zero-latency virtual keypad architecture, in-memory catalog indexing with IndexedDB, and ergonomic keyboard triggers for under-3-click checkout operations.',
    },
    achievements: {
      es: [
        'Respuesta táctil instantánea con retroalimentación sonora procedural.',
        'Manejo de estados de transacción complejos (cambio, propina, múltiples métodos de pago).',
        'Resiliencia total ante desconexiones de red durante el ticket.',
      ],
      en: [
        'Instant tactile feedback with procedural audio response.',
        'Complex transaction state management (change, tips, split payment flows).',
        'Uninterrupted checkout execution during intermittent network loss.',
      ],
    },
    architecture: {
      nodes: [
        { id: 'pos', label: 'Touch POS Terminal Interface', type: 'client' },
        { id: 'engine', label: 'Client-Side Transaction Engine', type: 'service' },
        { id: 'idb', label: 'IndexedDB Catalog & Ticket Cache', type: 'storage' },
      ],
      connections: [
        { from: 'pos', to: 'engine', label: 'Touch Input' },
        { from: 'engine', to: 'idb', label: 'Local Store' },
      ],
    },
  },
  {
    id: 'homelab-infra',
    slug: 'homelab-infrastructure',
    title: 'Home Lab & Private Infrastructure',
    subtitle: 'Self-Hosted Bare-Metal Hypervisor & Cloudflare Zero Trust Mesh',
    category: 'infrastructure',
    role: {
      es: 'Ingeniero de Infraestructura & SysAdmin',
      en: 'Infrastructure Engineer & SysAdmin',
    },
    organization: 'Infraestructura Personal & Lab',
    period: '2023 - Presente',
    featured: true,
    orbitIndex: 7,
    stack: ['Docker', 'Linux (Debian / Ubuntu)', 'WSL2', 'Cloudflare Zero Trust', 'Nginx Reverse Proxy', 'SSH Keys', 'WireGuard', 'Pi-hole', 'Prometheus / Grafana'],
    summary: {
      es: 'Laboratorio de infraestructura local y servidores bare-metal diseñado para el despliegue de contenedores, virtualización, túneles privados seguros y experimentación de arquitecturas de red resilientes.',
      en: 'Dedicated bare-metal on-premise infrastructure lab configured for containerized orchestration, virtualization, secure private tunneling, and continuous experimentation of resilient network topologies.',
    },
    challenge: {
      es: 'Alojar y probar servicios web, bases de datos y entornos de staging en hardware local sin abrir puertos en el router residencial ni exponer IPs públicas vulnerables a escaneos.',
      en: 'Hosting and testing microservices, databases, and staging environments on local hardware without opening router ports or exposing home public IPs to external port scans.',
    },
    solution: {
      es: 'Configuración de túneles Cloudflare Zero Trust (cloudflared) con políticas de acceso por autenticación mutua, reverse proxies con Nginx y monitoreo de métricas de hardware.',
      en: 'Engineered outbound Cloudflare Zero Trust tunnels (cloudflared) with mTLS and policy enforcement, Nginx reverse proxies, and containerized resource telemetry.',
    },
    achievements: {
      es: [
        'Red privada Zero Trust con cero puertos WAN expuestos en el router.',
        'Entorno de virtualización WSL2 / Docker con más de 12 microservicios activos.',
        'Filtrado DNS y segmentación de tráfico local para aislamiento de laboratorio.',
        'Servidores SSH con llaves criptográficas Ed25519 y fail2ban activado.',
      ],
      en: [
        'Zero Trust private mesh with zero public WAN ports open on the gateway.',
        'WSL2 & Docker virtualization hosting 12+ active microservices.',
        'Network-wide DNS sinkholing and subnet segmentation for isolated workloads.',
        'Hardened SSH bastions using Ed25519 public keys and active fail2ban policies.',
      ],
    },
    architecture: {
      nodes: [
        { id: 'wan', label: 'Public Internet / Clients', type: 'client' },
        { id: 'cf', label: 'Cloudflare Edge & Access Policies', type: 'security' },
        { id: 'tunnel', label: 'Cloudflared Daemon (Outbound Tunnel)', type: 'gateway' },
        { id: 'nginx', label: 'Nginx Reverse Proxy Internal Router', type: 'service' },
        { id: 'containers', label: 'Docker Compose Container Mesh', type: 'service' },
        { id: 'hardware', label: 'Linux Bare-Metal Host / WSL2', type: 'storage' },
      ],
      connections: [
        { from: 'wan', to: 'cf', label: 'Encrypted Request' },
        { from: 'cf', to: 'tunnel', label: 'Private Tunnel Wire' },
        { from: 'tunnel', to: 'nginx', label: 'Internal Loopback' },
        { from: 'nginx', to: 'containers', label: 'Docker Bridge' },
        { from: 'containers', to: 'hardware', label: 'Kernel Namespaces' },
      ],
    },
    metrics: [
      { label: { es: 'Puertos WAN Abiertos', en: 'Open WAN Ports' }, value: '0 (Zero Trust)' },
      { label: { es: 'Servicios Aislados', en: 'Containerized Services' }, value: '12+' },
      { label: { es: 'Cifrado de Túnel', en: 'Tunnel Encryption' }, value: 'WireGuard / QUIC' },
    ],
  },
];
