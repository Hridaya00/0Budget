// Single source of truth for site navigation, used by the Navbar and Footer.
export const mainNav = [
  { label: 'Projects', to: '/projects' },
  { label: 'Creators', to: '/creators' },
  { label: 'Opportunities', to: '/opportunities' },
  { label: 'For Companies', to: '/companies' },
]

export const footerGroups = [
  {
    title: 'Explore',
    links: [
      { label: 'Projects', to: '/projects' },
      { label: 'Creators', to: '/creators' },
      { label: 'Opportunities', to: '/opportunities' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'For Companies', to: '/companies' },
      { label: 'Create a Project', to: '/projects/new' },
      { label: 'Join 0Budget', to: '/signup' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Community Guidelines', to: '/guidelines' },
      { label: 'Terms', to: '/terms' },
      { label: 'Privacy', to: '/privacy' },
    ],
  },
]
