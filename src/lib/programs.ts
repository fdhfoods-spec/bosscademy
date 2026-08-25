import { Cpu, Shield, Briefcase, type LucideIcon } from 'lucide-react'

export type ProgramDetail = {
  id: string
  title: string
  outcome: string
  duration: string
  summary: string
  icon: LucideIcon
  whatYouLearn: string[]
  toolsCovered: string[]
  realWorldApplication: string
  whoFor: string[]
}

/** Full content for /programs/[slug] decision pages */
export type CoursePageExtras = {
  heroSubtitle: string
  /** Outcome-focused: what you can do after */
  ableToDo: string[]
  learnByDoing: {
    intro: string
    tasks: string[]
  }
  courseDetails: {
    mode: string
    support: string
  }
  whyThisCourse: string[]
  faq: { q: string; a: string }[]
}

export type CourseProgram = ProgramDetail & CoursePageExtras

export const programs: CourseProgram[] = [
  {
    id: 'pcb-design',
    title: 'PCB Design',
    outcome: 'Design and route printed circuit boards ready for manufacturing.',
    heroSubtitle:
      'Learn the fundamentals of PCB Design from schematic creation to Gerber file generation.',
    duration: '6 Weeks',
    summary:
      'Comprehensive training on designing electronic circuits and PCBs using industry-standard tools.',
    icon: Cpu,
    whatYouLearn: [
      'Understand electronic components and reading schematics',
      'Create custom component footprints and libraries',
      'Route complex multi-layer boards',
      'Generate and verify manufacturing files (Gerber/NC Drill)',
    ],
    toolsCovered: [
      'Altium Designer / KiCad',
      'Proteus for Simulation',
      'LTspice'
    ],
    realWorldApplication:
      'You will design a complete functioning circuit board from a raw schematic, mirroring actual hardware engineering workflows.',
    whoFor: [
      'Electronics & Electrical Engineering students',
      'Hardware enthusiasts and hobbyists',
      'Professionals looking to upskill in hardware design',
    ],
    ableToDo: [
      'Read and translate schematics to board layouts',
      'Apply design rules for signal integrity and power distribution',
      'Prepare comprehensive documentation for fabrication',
    ],
    learnByDoing: {
      intro:
        'You will learn by actually designing boards, starting from simple single-layer designs to complex multi-layer high-speed boards.',
      tasks: [
        'Draw a schematic for a power supply circuit',
        'Route a 4-layer microcontroller board',
        'Run design rule checks and generate Gerber files',
      ],
    },
    courseDetails: {
      mode: 'Online live sessions + practical design assignments',
      support: 'Dedicated mentor support and design reviews',
    },
    whyThisCourse: [
      'Industry-standard tools: Learn on software actually used by top companies',
      'Project-based: Build a portfolio of real PCB designs',
      'Expert feedback: Get your layouts reviewed by experienced engineers',
    ],
    faq: [
      {
        q: 'Do I need prior experience?',
        a: 'Basic understanding of electronics is helpful, but we start from the fundamentals of schematics.',
      },
      {
        q: 'What software will we use?',
        a: 'We primarily focus on widely used tools like KiCad and Altium Designer.',
      },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    outcome: 'Master foundational and advanced concepts to protect networks and systems.',
    heroSubtitle:
      'Gain hands-on experience with ethical hacking, network defense, and risk management.',
    duration: '10 Weeks',
    summary:
      'A complete guide to understanding vulnerabilities, securing infrastructure, and responding to cyber threats.',
    icon: Shield,
    whatYouLearn: [
      'Identify and exploit system vulnerabilities (Ethical Hacking)',
      'Secure networks and implement firewalls/IDS',
      'Understand cryptography and data protection',
      'Perform incident response and digital forensics',
    ],
    toolsCovered: [
      'Kali Linux',
      'Wireshark & Nmap',
      'Metasploit Framework',
      'Burp Suite'
    ],
    realWorldApplication:
      'You will simulate cyber attacks and defenses in a safe lab environment to understand real-world security scenarios.',
    whoFor: [
      'IT professionals moving into security',
      'Students interested in ethical hacking',
      'System administrators wanting to secure their networks',
    ],
    ableToDo: [
      'Conduct vulnerability assessments on networks and web apps',
      'Monitor network traffic for suspicious activities',
      'Implement security policies and best practices',
    ],
    learnByDoing: {
      intro:
        'Learning cybersecurity requires practice. You will spend most of your time in virtual labs analyzing traffic and testing vulnerabilities.',
      tasks: [
        'Capture and analyze packets using Wireshark',
        'Perform a penetration test on a deliberately vulnerable application',
        'Configure a secure firewall ruleset',
      ],
    },
    courseDetails: {
      mode: 'Online sessions + extensive virtual lab practice',
      support: 'Community forum and expert guidance on complex labs',
    },
    whyThisCourse: [
      'Practical labs: Real-world scenarios using virtual machines',
      'Comprehensive curriculum: Covers both offensive and defensive strategies',
      'Current tools: Train with the standard toolkit used by professionals',
    ],
    faq: [
      {
        q: 'Is this course suitable for beginners?',
        a: 'Basic knowledge of networking and operating systems is recommended before starting.',
      },
      {
        q: 'Will this prepare me for certifications?',
        a: 'Yes, the curriculum aligns well with foundational certifications like Security+ and CEH.',
      },
    ],
  },
  {
    id: 'sap',
    title: 'SAP',
    outcome: 'Navigate and configure SAP ERP systems for enterprise business processes.',
    heroSubtitle:
      'Learn how large enterprises manage their operations using SAP software.',
    duration: '8 Weeks',
    summary:
      'In-depth training on SAP modules, business processes, and system navigation used globally.',
    icon: Briefcase,
    whatYouLearn: [
      'Navigate the SAP GUI and understand the system architecture',
      'Execute core business processes in Financials or Materials Management',
      'Generate and analyze standard SAP reports',
      'Understand integration between different SAP modules',
    ],
    toolsCovered: [
      'SAP ERP / S/4HANA',
      'SAP Fiori',
      'SAP GUI'
    ],
    realWorldApplication:
      'You will run end-to-end business cycles (like Procure-to-Pay or Order-to-Cash) exactly as they happen in a corporate environment.',
    whoFor: [
      'Business analysts and supply chain professionals',
      'Recent graduates aiming for enterprise roles',
      'IT support staff dealing with SAP systems',
    ],
    ableToDo: [
      'Process transactions efficiently in the SAP system',
      'Troubleshoot basic user issues and errors',
      'Extract data and create custom views for business reporting',
    ],
    learnByDoing: {
      intro:
        'You will get hands-on access to an SAP training environment to practice transactions and processes.',
      tasks: [
        'Create a Purchase Order and process a Goods Receipt',
        'Post a financial document and review the general ledger',
        'Customize your user profile and favorite transactions',
      ],
    },
    courseDetails: {
      mode: 'Live demonstrations + hands-on system access',
      support: 'Guided walk-throughs for complex transactions',
    },
    whyThisCourse: [
      'System Access: Practice on a real SAP environment',
      'Process-oriented: Focus on how business works, not just clicking buttons',
      'Career-ready: SAP skills are highly sought after by top global companies',
    ],
    faq: [
      {
        q: 'Do I get access to an SAP system?',
        a: 'Yes, students are provided with access to a training environment during the course.',
      },
      {
        q: 'Which module does this focus on?',
        a: 'We cover navigation fundamentals and give an overview of core modules like FI, MM, and SD.',
      },
    ],
  },
]

export function getProgramBySlug(slug: string): CourseProgram | undefined {
  return programs.find((p) => p.id === slug)
}
