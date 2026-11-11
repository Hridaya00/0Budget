import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'

const steps = [
  { title: 'Create your profile', text: 'Add your roles, skills, portfolio links and availability so others can find you.' },
  { title: 'Share or discover projects', text: 'Post your film idea with the roles you need, or browse projects looking for your skills.' },
  { title: 'Connect and agree', text: 'Send a collaboration request, chat, and settle credits, rights and compensation before you shoot.' },
  { title: 'Make it, and show it', text: 'Finish the film, credit your crew, and add it to your portfolio.' },
]

export default function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface py-24">
      <Container>
        <SectionHeading eyebrow="How it works" title="From idea to crew in four steps" align="center" />
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="font-display text-5xl font-extrabold text-accent/30">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
