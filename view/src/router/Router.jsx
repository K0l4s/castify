import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from '../pages/landingPage/LandingPage'
import Profile from '../pages/profile/Profile'

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage/> } />
      <Route path="/about" element={<h1>Hello</h1>} />
      <Route path="/profile" element={<Profile/>} />
    </Routes>
  )
}

export default Router