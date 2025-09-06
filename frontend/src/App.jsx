import React from 'react'
import './App.css'
import Home from './pages/home'
import Login from './pages/Login'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import LabServices from './components/Hero-com/LabServices'
import Services from './pages/Services'
import DoctorsList from './pages/DoctorsList'
import Dashboard from './pages/Dashboard'




function App() {
 
  return (
    <>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/appointment"element={<Appointment/>}/>
      <Route path="/labservices" element={<LabServices/>}/>
      
      <Route path="/services" element={<Services/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path='/doctors' element={<DoctorsList/>}/>
      <Route path='/dashboard'element={<Dashboard/>}/>
  
    </Routes>
    

    </>
  )
}

export default App
