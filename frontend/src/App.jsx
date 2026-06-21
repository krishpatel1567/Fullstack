import { useState } from 'react'
import './index.css'
import AppRoutes from "./routes/AppRoutes"
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App
