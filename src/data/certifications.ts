export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  url?: string;
  description: {
    es: string;
    en: string;
  };
  skills: string[];
}

export const certificationsData: CertificationItem[] = [
  {
    id: 'cisco-linux-fundamentals',
    name: 'NDG Linux Fundamentals / NDG Linux Essentials',
    issuer: 'Cisco Networking Academy & NDG',
    issueDate: '2023',
    credentialId: 'CISCO-LNX-84920',
    url: 'https://www.netacad.com',
    description: {
      es: 'Dominio de comandos en terminal Linux, permisos POSIX, gestión de procesos, administración de usuarios y configuración de utilidades del sistema en entornos tipo Unix.',
      en: 'Proficiency in Linux terminal commands, POSIX filesystem permissions, process management, user administration, and Unix-like system utilities configuration.',
    },
    skills: ['Linux CLI', 'Bash Scripting', 'File Permissions', 'Package Management', 'System Administration'],
  },
  {
    id: 'networking-foundations',
    name: 'Network Addressing and Basic Troubleshooting',
    issuer: 'Cisco Networking Academy',
    issueDate: '2023',
    credentialId: 'CISCO-NET-55104',
    url: 'https://www.netacad.com',
    description: {
      es: 'Subnetting IPv4/IPv6, modelos OSI y TCP/IP, resolución de incidencias de conectividad y análisis de tráfico de red.',
      en: 'IPv4/IPv6 subnetting, OSI and TCP/IP protocol stack analysis, connectivity troubleshooting, and network packet flow inspection.',
    },
    skills: ['IPv4 Subnetting', 'IPv6', 'TCP/IP', 'ICMP Diagnostics', 'Network Routing'],
  },
  {
    id: 'docker-container-essentials',
    name: 'Container Architecture & Virtualization Lab',
    issuer: 'Self-Directed & Applied Infrastructure',
    issueDate: '2024',
    credentialId: 'INFRA-DKR-2024',
    description: {
      es: 'Diseño de Dockerfiles eficientes, orquestación de servicios en Docker Compose, aislamiento de redes internas y persistencia de volúmenes en producción.',
      en: 'Design of multi-stage Dockerfiles, Docker Compose service orchestration, internal bridge network isolation, and volume persistence in live environments.',
    },
    skills: ['Docker', 'Docker Compose', 'Container Security', 'Volume Mounts', 'Microservices'],
  },
];
