export interface SkillItem {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'databases' | 'infrastructure' | 'other';
  proficiency: 'core' | 'advanced' | 'proficient';
  experienceYears?: string;
  context: {
    es: string;
    en: string;
  };
  highlightProject?: string;
}

export interface SkillCategory {
  id: 'frontend' | 'backend' | 'mobile' | 'databases' | 'infrastructure' | 'other';
  title: { es: string; en: string };
  description: { es: string; en: string };
  orbitRadius: number; // orbital ring distance
  skills: SkillItem[];
}

export const skillsCategories: SkillCategory[] = [
  {
    id: 'frontend',
    title: { es: 'Frontend & Interfaces Reactivas', en: 'Frontend & Reactive UI' },
    description: {
      es: 'Arquitectura de interfaces dinámicas, optimización de renderizado y control de estado reactivo.',
      en: 'Dynamic interface architectures, rendering optimization, and reactive state management.',
    },
    orbitRadius: 14,
    skills: [
      {
        id: 'react',
        name: 'React',
        category: 'frontend',
        proficiency: 'core',
        context: {
          es: 'Construcción de portales administrativos desacoplados, paneles de control y estado distribuido.',
          en: 'Building decoupled administrative dashboards, real-time control panels, and distributed state.',
        },
        highlightProject: 'Gran Vía Sur / RedFeree',
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        category: 'frontend',
        proficiency: 'core',
        context: {
          es: 'Renderizado híbrido (SSR/SSG), App Router, Server Actions y optimización de activos.',
          en: 'Hybrid rendering (SSR/SSG), App Router, Server Actions, and asset optimization pipelines.',
        },
        highlightProject: 'Portfolio 3D / Enterprise Web',
      },
      {
        id: 'vue',
        name: 'Vue 3',
        category: 'frontend',
        proficiency: 'advanced',
        context: {
          es: 'Composition API, PWAs para brigadas en campo y reactividad de alta eficiencia.',
          en: 'Composition API, mobile field PWAs, and high-efficiency reactive components.',
        },
        highlightProject: 'Grupo SAOM (CAS)',
      },
      {
        id: 'vite',
        name: 'Vite',
        category: 'frontend',
        proficiency: 'core',
        context: {
          es: 'Bundling ultrarrápido ESM, configuración de hot reload y tooling moderno.',
          en: 'Ultra-fast ESM bundling, custom hot reload pipelines, and modern client tooling.',
        },
        highlightProject: 'Plaza Gran Vía Sur',
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        category: 'frontend',
        proficiency: 'core',
        context: {
          es: 'Sistemas de diseño atómicos, paletas sculk/dark mode y composiciones complejas sin CSS bloat.',
          en: 'Atomic design systems, custom dark palette tokens, and streamlined responsive layouts.',
        },
      },
    ],
  },
  {
    id: 'backend',
    title: { es: 'Backend & Lógica Transaccional', en: 'Backend & Transactional Logic' },
    description: {
      es: 'Gateways de orquestación, APIs REST de alta fidelidad y lógica de negocio auditable.',
      en: 'Orchestration gateways, high-fidelity REST APIs, and verifiable business logic.',
    },
    orbitRadius: 18,
    skills: [
      {
        id: 'nodejs',
        name: 'Node.js',
        category: 'backend',
        proficiency: 'core',
        context: {
          es: 'Middleware asíncrono, microservicios orientados a eventos y proxy de integración ERP.',
          en: 'Asynchronous event-driven middleware, microservices, and ERP integration proxies.',
        },
        highlightProject: 'Gran Vía Sur Gateway',
      },
      {
        id: 'express',
        name: 'Express',
        category: 'backend',
        proficiency: 'core',
        context: {
          es: 'Ruteo modularizado, cadenas de middleware de autenticación y servicios REST limpios.',
          en: 'Modular routing, strict authentication middleware chains, and clean REST endpoints.',
        },
        highlightProject: 'Dreaming Flowers / RedFeree',
      },
      {
        id: 'php',
        name: 'PHP',
        category: 'backend',
        proficiency: 'advanced',
        context: {
          es: 'Refactorización de arquitecturas legadas (Yii 1.1), modernización a servicios REST y firmas.',
          en: 'Legacy framework refactoring (Yii 1.1), REST service modernization, and cryptographic vaults.',
        },
        highlightProject: 'Grupo SAOM (CAS)',
      },
      {
        id: 'dotnet',
        name: '.NET / C#',
        category: 'backend',
        proficiency: 'proficient',
        context: {
          es: 'Modelado de dominio tipado, aplicaciones de escritorio WPF y motores de reglas de negocio.',
          en: 'Strongly typed domain modeling, desktop WPF apps, and transactional business engines.',
        },
        highlightProject: 'Sportk Management',
      },
    ],
  },
  {
    id: 'mobile',
    title: { es: 'Desarrollo Móvil & Campo', en: 'Mobile & Field Engineering' },
    description: {
      es: 'Aplicaciones táctiles nativas y móviles resilientes a la pérdida de conectividad.',
      en: 'Touch-optimized native apps and offline-first mobile tools engineered for field teams.',
    },
    orbitRadius: 22,
    skills: [
      {
        id: 'flutter',
        name: 'Flutter',
        category: 'mobile',
        proficiency: 'advanced',
        context: {
          es: 'Desarrollo multiplataforma, layouts adaptativos y persistencia reactiva local.',
          en: 'Cross-platform UI development, adaptive layouts, and reactive offline state caching.',
        },
        highlightProject: 'EduTrack Mobile',
      },
      {
        id: 'dart',
        name: 'Dart',
        category: 'mobile',
        proficiency: 'advanced',
        context: {
          es: 'Programación asíncrona mediante Streams, Futures y tipado estricto para clientes móviles.',
          en: 'Asynchronous event architecture using Streams, Futures, and sound null-safe typing.',
        },
        highlightProject: 'EduTrack Mobile',
      },
    ],
  },
  {
    id: 'databases',
    title: { es: 'Bases de Datos & Persistencia', en: 'Databases & Persistence' },
    description: {
      es: 'Modelos relacionales normalizados, almacenes no estructurados y capas de caché distribuida.',
      en: 'Normalized relational architectures, document stores, and distributed caching tiers.',
    },
    orbitRadius: 26,
    skills: [
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        category: 'databases',
        proficiency: 'core',
        context: {
          es: 'Bases de datos transaccionales multi-tenant, índices compuestos y consistencia ACID estricta.',
          en: 'Multi-tenant transactional schemas, compound indices, and strict ACID data guarantees.',
        },
        highlightProject: 'Odoo 19 / Gran Vía Sur',
      },
      {
        id: 'mysql',
        name: 'MySQL',
        category: 'databases',
        proficiency: 'core',
        context: {
          es: 'Diseño de esquemas relacionales, triggers y consultas optimizadas para catálogos y órdenes.',
          en: 'Relational schema design, triggers, and query optimization for orders and inventory.',
        },
        highlightProject: 'Grupo SAOM / Dreaming Flowers',
      },
      {
        id: 'supabase',
        name: 'Supabase',
        category: 'databases',
        proficiency: 'advanced',
        context: {
          es: 'Políticas de seguridad a nivel de fila (RLS), WebSockets en tiempo real y Auth sin fricción.',
          en: 'Row Level Security (RLS) policies, real-time database WebSockets, and streamlined Auth.',
        },
        highlightProject: 'RedFeree',
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'databases',
        proficiency: 'proficient',
        context: {
          es: 'Modelado documental no estructurado para bitácoras dinámicas y eventos variables.',
          en: 'Document modeling for polymorphic payloads, audit logs, and unstructured telemetry.',
        },
      },
    ],
  },
  {
    id: 'infrastructure',
    title: { es: 'Infraestructura, Redes & DevSecOps', en: 'Infrastructure & DevSecOps' },
    description: {
      es: 'Aislamiento en contenedores, seguridad perimetral Zero Trust y orquestación de red privada.',
      en: 'Containerized isolation, Zero Trust boundary security, and private network orchestration.',
    },
    orbitRadius: 30,
    skills: [
      {
        id: 'linux',
        name: 'Linux (Debian / Ubuntu)',
        category: 'infrastructure',
        proficiency: 'core',
        context: {
          es: 'Administración de servidores bare-metal, systemd, gestión de permisos y bash scripting.',
          en: 'Bare-metal server administration, systemd service lifecycle, and custom bash tooling.',
        },
        highlightProject: 'Home Lab & Staging',
      },
      {
        id: 'docker',
        name: 'Docker & Compose',
        category: 'infrastructure',
        proficiency: 'core',
        context: {
          es: 'Contenedorización reproducible, redes virtuales internas y volúmenes persistentes.',
          en: 'Reproducible containerization, internal bridge networks, and persistent data volumes.',
        },
        highlightProject: 'Gran Vía Sur / Lab',
      },
      {
        id: 'wsl',
        name: 'WSL2 (Windows Subsystem for Linux)',
        category: 'infrastructure',
        proficiency: 'core',
        context: {
          es: 'Entornos de desarrollo Linux de alto rendimiento integrados nativamente en Windows.',
          en: 'High-performance headless Linux development sandboxes integrated with Windows host.',
        },
      },
      {
        id: 'cloudflare-zt',
        name: 'Cloudflare Zero Trust',
        category: 'infrastructure',
        proficiency: 'core',
        context: {
          es: 'Túneles privados sin exposición de puertos WAN, autenticación mutua y control de acceso.',
          en: 'Private tunnels with zero open WAN ports, mutual TLS enforcement, and access policies.',
        },
        highlightProject: 'Gran Vía Sur & Home Lab',
      },
      {
        id: 'reverse-proxies',
        name: 'Reverse Proxies & Nginx',
        category: 'infrastructure',
        proficiency: 'advanced',
        context: {
          es: 'Terminación SSL/TLS, balanceo de carga, limitación de tasa (rate limiting) y ruteo HTTP.',
          en: 'SSL/TLS termination, local routing, rate limiting, and reverse proxying.',
        },
      },
      {
        id: 'networking',
        name: 'Networking & VPNs',
        category: 'infrastructure',
        proficiency: 'advanced',
        context: {
          es: 'Subnetting IPv4/IPv6, DNS privado (Pi-hole), túneles WireGuard y filtrado de paquetes.',
          en: 'IPv4/IPv6 subnetting, internal DNS sinkholes, WireGuard tunnels, and firewall rules.',
        },
      },
    ],
  },
  {
    id: 'other',
    title: { es: 'Protocolos, Integraciones & Automatización', en: 'Protocols & Automation' },
    description: {
      es: 'Conexión con núcleos corporativos, protocolos RPC y automatización de flujos de trabajo.',
      en: 'Enterprise core integrations, RPC protocols, and autonomous workflow pipelines.',
    },
    orbitRadius: 34,
    skills: [
      {
        id: 'git',
        name: 'Git & Version Control',
        category: 'other',
        proficiency: 'core',
        context: {
          es: 'Flujos Git estructurados, resolución de ramas complejas, hooks y despliegues controlados.',
          en: 'Branch management, pre-commit validation hooks, and version control discipline.',
        },
      },
      {
        id: 'rest-apis',
        name: 'REST APIs & OpenAPI',
        category: 'other',
        proficiency: 'core',
        context: {
          es: 'Diseño de endpoints idempotentes, códigos de estado canónicos y documentación Swagger.',
          en: 'Idempotent endpoint design, canonical HTTP status handling, and OpenAPI schemas.',
        },
      },
      {
        id: 'json-rpc',
        name: 'JSON-RPC',
        category: 'other',
        proficiency: 'advanced',
        context: {
          es: 'Comunicación tipada remota de alto rendimiento para interconexión directa con el motor Odoo.',
          en: 'High-throughput remote procedure calls for direct programmatic Odoo ERP orchestration.',
        },
        highlightProject: 'Gran Vía Sur',
      },
      {
        id: 'odoo',
        name: 'Odoo ERP (v17 / v19)',
        category: 'other',
        proficiency: 'advanced',
        context: {
          es: 'Personalización de modelos ORM en Python, vistas XML y arquitectura Headless para backend puro.',
          en: 'Python ORM customization, XML views, and decoupled Headless ERP architecture.',
        },
        highlightProject: 'Gran Vía Sur',
      },
      {
        id: 'automation',
        name: 'Automation & Scripting',
        category: 'other',
        proficiency: 'core',
        context: {
          es: 'Automatización de tareas periódicas con cron, sincronizadores nocturnos y scripts en bash/python.',
          en: 'Scheduled cron orchestrations, nightly sync batchers, and automation scripts.',
        },
      },
    ],
  },
];
