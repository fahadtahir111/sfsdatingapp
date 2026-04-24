import React from 'react'
import Main from './components/Main-Folder/main'
import Slider from './components/Slider/slider'
import PremiumFeatures from './components/Premium/premium'
import { Footer, PricingSection } from './components/Plan/plan'

const page = () => {
  return (
    <main>
      <Main></Main>
      <Slider></Slider>
      <PremiumFeatures></PremiumFeatures>
      <PricingSection></PricingSection>
      <Footer></Footer>
      
      
      
    </main>

    
  )
}
export default page
