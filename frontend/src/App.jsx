import React from 'react'
import './App.css'
//import Home from './pages/home'
import Login from './pages/Login'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import LabServices from './components/Hero-com/LabServices'
import Services from './pages/Services'
import DoctorsList from './pages/DoctorsList'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import DoctorDashboard from './components/Dashboard/Doctor/DoctorDashboard'
import AdminDashboard from './components/Dashboard/Admin/AdminDashboard'
import UserDashboard from './components/Dashboard/User/UserDashboard'
import VideoCallPage from './pages/VideoCallPage'
import ScrollToTop from './components/ScrollToTop'




function App() {
 
  return (
    <>
    <ScrollToTop />
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
      
      {/* Video Call Route */}
      <Route path='/video-call' element={<VideoCallPage/>}/>
      
      {/* Role-based dashboard routes */}
      <Route path='/dashboard/user'element={<UserDashboard/>}/>
      <Route path='/dashboard/doctor'element={<DoctorDashboard/>}/>
      <Route path='/dashboard/admin'element={<AdminDashboard/>}/>
      
      {/* Legacy routes for backward compatibility */}
      <Route path='/userDashboard'element={<UserDashboard/>}/>
      <Route path='/doctorDashboard'element={<DoctorDashboard/>}/>
      <Route path='/adminDashboard'element={<AdminDashboard/>}/>
  
    </Routes>
    

    </>
  )
}

export default App
