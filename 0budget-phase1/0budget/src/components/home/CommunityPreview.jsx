import { Film, Users } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../ui/Container'
import EmptyState from '../ui/EmptyState'
import SectionHeading from '../ui/SectionHeading'

// Phase 1: no database yet, so we show honest empty states.
// In Phase 4 these will load real featured projects and creators from Supabase.
export default function CommunityPreview() {
  return (
    <section className="py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Featured projects" title="Projects looking for a crew" />
            <div className="mt-8">
              <EmptyState
                icon={Film}
                title="No featured projects yet"
                description="0Budget is just getting started. Be among the first to share a project and shape the community."
                action={<Button to="/projects/new">Share your project</Button>}
              />
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Featured creators" title="Meet the people behind the films" />
            <div className="mt-8">
              <EmptyState
                icon={Users}
                title="No featured creators yet"
                description="Creator profiles will appear here once members join. Create yours and get discovered."
                action={<Button to="/signup">Join 0Budget</Button>}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
