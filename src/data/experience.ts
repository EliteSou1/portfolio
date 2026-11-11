export interface ExperienceItem {
  id: string;
  role: { es: string; en: string };
  company: string;
  department?: string;
  location: string;
  period: string;
  type: { es: string; en: string };
  summary: { es: string; en: string };
  responsibilities: { es: string[]; en: string[] };
  technologies: string[];
  impactMetrics: { label: { es: string; en: string }; value: string }[];
}

export const experienceData: ExperienceItem[] = [
  {
    id: 'gran-via-sur',
    role: {
      es: 'Arquitecto e Integrador de Sistemas Empresariales',
      en: 'Enterprise Systems Architect & Integrator',
    },
    company: 'Plaza Gran Vía Sur / NKOIT',
    department: 'Operaciones & Desarrollo Tecnológico',
    location: 'Cancún, México',
    period: '2024 - Presente',
    type: {
      es: 'Desarrollo Tecnológico / Arquitectura de Software',
      en: 'Enterprise Tech Architecture & Software Development',
    },
    summary: {
      es: 'Liderazgo técnico en la integración y desacoplamiento del sistema de gestión comercial y condominal de alta demanda, conectando el ERP Odoo con interfaces reactivas seguras.',
      en: 'Technical leadership in integrating and decoupling commercial and residential management systems, bridging the Odoo ERP core with secured reactive frontends.',
    },
    responsibilities: {
      es: [
        'Diseño de arquitectura headless utilizando Odoo 19 como repositorio transaccional protegido sin exposición directa a internet.',
        'Desarrollo de gateway intermediario en Node.js y Express para orquestar consultas JSON-RPC y almacenar en caché datos de alta demanda con Redis.',
        'Implementación de controles de acceso y perímetro de seguridad con Cloudflare Zero Trust.',
        'Desarrollo del dashboard de administración en React y Vite para la visualización de locales, cobros, contratos y leads.',
        'Automatización de conciliación contable y soporte para pasarelas de pago y timbrado fiscal CFDI.',
      ],
      en: [
        'Architected headless ERP integration with Odoo 19 acting as a protected transactional core with zero public exposure.',
        'Built Node.js and Express intermediary proxy gateway to handle JSON-RPC calls and leverage Redis caching for peak traffic.',
        'Enforced perimeter security and fine-grained access policies using Cloudflare Zero Trust.',
        'Engineered responsive administration dashboard in React and Vite for unit management, automated billing, and commercial leads.',
        'Automated payment reconciliations and prepared infrastructure for gateway integrations and fiscal electronic invoicing.',
      ],
    },
    technologies: ['Odoo 19', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'React', 'Vite', 'JSON-RPC', 'Redis', 'Cloudflare Zero Trust'],
    impactMetrics: [
      { label: { es: 'Carga en Base ERP', en: 'ERP Base Load' }, value: '-65%' },
      { label: { es: 'Latencia de Consulta', en: 'Query Latency' }, value: '< 85ms' },
      { label: { es: 'Seguridad Perimetral', en: 'Security Perimeter' }, value: 'Zero Trust mTLS' },
    ],
  },
  {
    id: 'grupo-saom',
    role: {
      es: 'Desarrollador de Software (Prácticas Profesionales)',
      en: 'Software Developer (Professional Internship)',
    },
    company: 'Grupo SAOM — Proyecto CAS',
    department: 'Mantenimiento Técnico & Sistemas',
    location: 'Cancún, México',
    period: '2023 - 2024',
    type: {
      es: 'Prácticas Profesionales / Desarrollo Tecnológico',
      en: 'Internship / Field Tech Digitalization',
    },
    summary: {
      es: 'Digitalización y optimización de las operaciones en campo para brigadas de mantenimiento técnico, reemplazando flujos en papel con una plataforma web móvil con geolocalización y firma digital.',
      en: 'Digitalization and operational optimization for technical maintenance crews, replacing legacy paper logs with a mobile web platform featuring live dispatch and signature verification.',
    },
    responsibilities: {
      es: [
        'Desarrollo de interfaz móvil progresiva (PWA) en Vue 3 y Vite, optimizada para trabajo en campo y pantallas táctiles.',
        'Implementación de módulo de captura de firmas digitales sobre HTML5 Canvas para certificación y cierre inmediato de servicios.',
        'Integración con la API de Google Maps para visualización y asignación eficiente de rutas y técnicos según cercanía geográfica.',
        'Modernización y consumo de servicios legados basados en PHP / framework Yii 1.1.',
        'Centralización de expedientes técnicos digitales y bitácoras de servicio para auditorías de calidad.',
      ],
      en: [
        'Engineered mobile PWA in Vue 3 and Vite tailored for field technicians on mobile devices.',
        'Created digital signature capture canvas enabling immediate on-site client sign-off and PDF generation.',
        'Integrated Google Maps API for real-time dispatch visualization and technician assignment by proximity.',
        'Connected modern client interfaces to legacy backend services built on PHP and Yii 1.1 framework.',
        'Centralized digital technical history records and service logs for quality and maintenance audits.',
      ],
    },
    technologies: ['Vue 3', 'Vite', 'Tailwind CSS', 'PHP', 'Yii 1.1', 'Google Maps API', 'HTML5 Canvas', 'MySQL'],
    impactMetrics: [
      { label: { es: 'Tiempo de Cierre', en: 'Closing Time' }, value: 'De 48h a Inmediato' },
      { label: { es: 'Uso de Papel', en: 'Paper Usage' }, value: 'Reducido 100%' },
      { label: { es: 'Satisfacción Brigadas', en: 'Crew Satisfaction' }, value: '98%' },
    ],
  },
];
