/**
 * Portfolio content — migrated from original static HTML.
 * Single source of truth for copy and links.
 */

export const site = {
  name: 'Venkat Vamsi',
  tagline: 'Software Developer · Full Stack · Cloud',
  roleWords: ['Software Developer', 'Full Stack Developer', 'Cloud Architect'],
  cvUrl: '/resume/Resume.pdf',
  heroImage: '/images/mlkp.jpg',
  aboutImage: '/images/internPic1.jpeg',
} as const

export const about = {
  heading: 'About Me',
  body: `Third Year Undergraduate at IIT Kharagpur, pursuing B.Tech in Computer Science and Engineering. I love making automations around me — you could call it being lazy, but I say being lazy isn't a big deal when we have tech to make it happen. All I need is my machine and workspace with positive aura.`,
} as const

export interface ExperienceItem {
  date: string
  org: string
  role: string
  description?: string
  link?: { label: string; href: string }
}

export const experience: ExperienceItem[] = [
  {
    date: 'December 2019 - Present',
    org: 'National Artificial Intelligence Resource Portal (NAIRP)',
    role: 'Full Stack Developer and Cloud Architect',
    description: 'Official AI Resource Portal for India; students learn AI with AWS-backed computation. Funded project under Amazon.',
    link: { label: 'Will be hosted soon', href: '#' },
  },
  {
    date: 'April 2021 - Present',
    org: 'PlanyticsAI',
    role: 'Backend Developer',
  },
  {
    date: 'April 2021 - Present',
    org: 'ShubuAI',
    role: 'Backend Developer',
  },
  {
    date: 'June 2020 - August 2020',
    org: 'Prodeo',
    role: 'Software Engineer',
    description: 'AI-enabled LIVE teaching and learning platform for teachers and students with higher efficiency.',
  },
  {
    date: 'July 2019 - August 2019',
    org: 'Mivo Solutions',
    role: 'App Developer Intern',
    description: 'React Native, UI/UX and smooth flow.',
    link: { label: 'Not yet hosted', href: '#' },
  },
]

export interface ProjectItem {
  name: string
  description: string
  links?: { label: string; href: string }[]
}

export const projects: ProjectItem[] = [
  {
    name: 'Rappel (Indie Project)',
    description: 'Location-aware reminders, not just time-based. Automation app using GCP and Firebase.',
    links: [{ label: 'GitHub', href: 'https://github.com/vammu920/Rappel' }],
  },
  {
    name: 'Dikhu',
    description: 'Nearest and safest area during tsunami; wave height from seismograph data. Built in under 8hrs with IBM, GCP, React Native.',
    links: [{ label: 'GitHub', href: 'https://github.com/vammu920/Dikhu' }],
  },
  {
    name: 'Apnainsti',
    description: 'One app for students to access all college portals in one place.',
    links: [
      { label: 'GitHub', href: 'https://github.com/vammu920/ApnaInsti-webview' },
      { label: 'Play Store', href: 'https://play.google.com/store/apps/details?id=com.apnainsti' },
    ],
  },
  {
    name: 'KgpAmica App',
    description: 'Used by KGP students to enhance curriculum skills with all required material in one place.',
    links: [{ label: 'Play Store', href: 'https://play.google.com/store/apps/details?id=com.kgpamica' }],
  },
  {
    name: 'E-Saathi',
    description: 'Working prototype guiding the uneducated into technology; interoperates with local apps and gives speech-based guidance.',
  },
]

export const skills = {
  heading: 'Technical Knowledge',
  groups: [
    {
      title: 'Languages',
      items: 'Javascript, C, Python, C#, Swift, PHP, Shell Script, Matlab, Java, XML, MySQL',
    },
    {
      title: 'Frameworks',
      items: 'JavaScript: React, React Native, Node.js, Angular, Express, Redux, Bootstrap. Python: Flask, pyrebase.',
    },
    {
      title: 'Tools & Services',
      items: 'Firebase, Git, AWS, EC2, Nginx, Postman, Android Studio, Xcode, Unity, MongoDB, NPM, Google Cloud, IBM Watson, Octave, NoSQL',
    },
  ],
} as const

export const contact = {
  heading: 'Get In Touch',
  formNote: 'Form under repair — use email for now.',
  email: 'vammu920@gmail.com',
  phone: '+91-7660036209',
  social: [
    { label: 'GitHub', href: 'https://github.com/vamsi920', icon: 'github' },
    { label: 'Twitter', href: 'https://twitter.com/vamsi21138728', icon: 'twitter' },
    { label: 'Instagram', href: 'https://www.instagram.com/waamci/', icon: 'instagram' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vamsi920/', icon: 'linkedin' },
    { label: 'Facebook', href: 'https://www.facebook.com/vamsi920', icon: 'facebook' },
  ],
} as const
