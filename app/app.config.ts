export default defineAppConfig({
  global: {
    meetingLink: '',
    available: true,
  },
  profile: {
    name: 'Vitor Diniz',
    job: 'AI Systems Architect / Senior Engineer / Applied Researcher',
    email: 'diniz@djin-tech.com',
    phone: '+81 70 8855 7401',
    picture: '/avatar.jpg',
  },
  socials: {
    github: 'https://github.com/dtechmaster',
    twitter: '',
    linkedin: '',
    instagram: '',
    spotify: '',
  },
  seo: {
    title: 'Vitor Diniz — AI Systems Architect & Senior Software Engineer',
    description: 'Senior Software Engineer, Systems Architect, and Applied Researcher with 10+ years of experience across AI, backend, embedded systems, and hardware-integrated platforms. R&D mindset. Founder with successful exit.',
    url: 'https://diniz.is',
  },
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'neutral',
    },
    notifications: {
      position: 'top-0 bottom-auto',
    },
    notification: {
      progress: {
        base: 'absolute bottom-0 end-0 start-0 h-0',
        background: 'bg-transparent dark:bg-transparent',
      },
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
      defaultVariants: {
        color: 'neutral',
      },
    },
    input: {
      defaultVariants: {
        color: 'neutral',
      },
    },
    textarea: {
      defaultVariants: {
        color: 'neutral',
      },
    },
    icons: {
      loading: 'lucide:loader',
    },
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],
})