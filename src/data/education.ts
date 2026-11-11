export interface EducationItem {
  id: string;
  degree: { es: string; en: string };
  institution: string;
  location: string;
  period: string;
  status: { es: string; en: string };
  description: { es: string; en: string };
  specialization: { es: string[]; en: string[] };
}

export const educationData: EducationItem[] = [
  {
    id: 'ingenieria-ti',
    degree: {
      es: 'Ingeniería en Tecnologías de la Información e Innovación Digital',
      en: 'B.S. in Information Technology Engineering & Digital Innovation',
    },
    institution: 'Universidad Tecnológica de Cancún (UT Cancún)',
    location: 'Cancún, Quintana Roo, México',
    period: '2023 - Presente (7.º Semestre)',
    status: {
      es: 'En curso activo',
      en: 'Currently enrolled (7th Semester)',
    },
    description: {
      es: 'Formación avanzada en ingeniería de software, arquitectura de sistemas distribuidos, seguridad de la información, gestión de proyectos tecnológicos y gobierno de TI.',
      en: 'Advanced study of software engineering, distributed systems architecture, information security, tech project management, and IT governance.',
    },
    specialization: {
      es: [
        'Arquitectura de software y microservicios',
        'Seguridad perimetral y administración de redes',
        'Modelado de bases de datos relacionales y no relacionales',
        'Desarrollo de aplicaciones multiplataforma y cloud',
      ],
      en: [
        'Software architecture & microservices patterns',
        'Perimeter network security & system administration',
        'Relational and NoSQL database modeling',
        'Cross-platform & cloud application engineering',
      ],
    },
  },
  {
    id: 'tsu-ti',
    degree: {
      es: 'Técnico Superior Universitario (TSU) en Tecnologías de la Información',
      en: 'Associate Degree (TSU) in Information Technology',
    },
    institution: 'Universidad Tecnológica de Cancún (UT Cancún)',
    location: 'Cancún, Quintana Roo, México',
    period: '2021 - 2023',
    status: {
      es: 'Graduado con Mención por Proyecto Práctico',
      en: 'Graduated with Practical Industry Distinction',
    },
    description: {
      es: 'Fundamentos sólidos en programación estructurada y orientada a objetos, bases de datos SQL, configuración de redes LAN/WAN y soporte de infraestructura tecnológica.',
      en: 'Rigorous foundation in structured and object-oriented programming, SQL databases, LAN/WAN network configuration, and enterprise hardware/software support.',
    },
    specialization: {
      es: [
        'Programación en C#, PHP y JavaScript',
        'Diseño y normalización de bases de datos relacionales',
        'Protocolos de comunicación TCP/IP y switching',
        'Desarrollo e integración de sistemas web',
      ],
      en: [
        'Programming with C#, PHP, and JavaScript',
        'Relational database design and normal forms',
        'TCP/IP networking fundamentals and routing',
        'Full-stack web system development and maintenance',
      ],
    },
  },
];
