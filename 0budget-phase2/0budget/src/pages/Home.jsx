import Hero from '../components/home/Hero'
import Intro from '../components/home/Intro'
import HowItWorks from '../components/home/HowItWorks'
import Categories from '../components/home/Categories'
import CommunityPreview from '../components/home/CommunityPreview'
import Benefits from '../components/home/Benefits'
import FinalCta from '../components/home/FinalCta'

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <HowItWorks />
      <Categories />
      <CommunityPreview />
      <Benefits />
      <FinalCta />
    </>
  )
}
