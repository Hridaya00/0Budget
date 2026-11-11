import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

// Pages that will be built in later phases. Each shows a clear "Coming soon" screen for now.
const upcoming = [
  { path: 'signup', title: 'Join 0Budget', phase: 2, description: 'Account registration is being built next. Check back soon.' },
  { path: 'login', title: 'Log in', phase: 2, description: 'Login arrives together with registration in the next phase.' },
  { path: 'projects', title: 'Explore Projects', phase: 4, description: 'Search and filter film projects looking for collaborators.' },
  { path: 'projects/new', title: 'Share Your Project', phase: 4, description: 'Post your project and the roles you need. Available once accounts are live.' },
  { path: 'creators', title: 'Explore Creators', phase: 3, description: 'Discover filmmakers, actors, writers, editors and more.' },
  { path: 'opportunities', title: 'Opportunities', phase: 7, description: 'Casting calls, festivals, workshops and competitions, curated by the 0Budget team.' },
  { path: 'companies', title: 'For Production Companies', phase: 6, description: 'Organisation profiles, talent discovery and project publishing for studios and production houses.' },
  { path: 'guidelines', title: 'Community Guidelines', phase: 9, description: 'Our community rules will be published before public launch.' },
  { path: 'terms', title: 'Terms and Conditions', phase: 9, description: 'The terms will be published before public launch.' },
  { path: 'privacy', title: 'Privacy Policy', phase: 9, description: 'The privacy policy will be published before public launch.' },
]

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        {upcoming.map(({ path, ...page }) => (
          <Route key={path} path={path} element={<ComingSoon {...page} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
