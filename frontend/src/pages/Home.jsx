import React from 'react'
import Navbar from '../components/Hero-com/Navbar'
import Hero from '../components/Hero-com/Hero'
import Services from '../components/Hero-com/ServicesComponent'
import Footer from '../components/Hero-com/Footer'

const Home = () => {
  return (
    <div>
        <Navbar/>
        <Hero/>
        <Services/>
        <Footer/>
      
    </div>
  )
}

export default Home
