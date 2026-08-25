import Hero from '@/components/public/Hero'
import HomeTrustStrip from '@/components/public/HomeTrustStrip'
import HomeWhoFor from '@/components/public/HomeWhoFor'
import HomeCoreCourses from '@/components/public/HomeCoreCourses'
import HomeNotSureSection from '@/components/public/HomeNotSureSection'
import HomeWhyChooseUs from '@/components/public/HomeWhyChooseUs'
import HomeHowItWorks from '@/components/public/HomeHowItWorks'
import HomeOurApproach from '@/components/public/HomeOurApproach'
import HomeWhatYouWillGain from '@/components/public/HomeWhatYouWillGain'
import HomeTransparencyBlock from '@/components/public/HomeTransparencyBlock'
import HomeTalkToUs from '@/components/public/HomeTalkToUs'
import HomeFinalCTA from '@/components/public/HomeFinalCTA'

export default function Home() {
  return (
    <div className="bg-surface">
      <Hero />
      <HomeTrustStrip />
      <HomeWhoFor />
      <HomeCoreCourses />
      <HomeNotSureSection />
      <HomeWhyChooseUs />
      <HomeHowItWorks />
      <HomeOurApproach />
      <HomeWhatYouWillGain />
      <HomeTransparencyBlock />
      <HomeTalkToUs />
      <HomeFinalCTA />
    </div>
  )
}
