// import { useState } from 'react'

import './App.css'
import { ThemeProvider } from './context/ThemeContext'
import Router from './routers/Router'

function App() {

  return (
    <>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </>
  )
}

export default App
