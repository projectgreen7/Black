import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Confirm from './pages/Confirm'
import Sent from './pages/Sent'

export default function App() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/sent" element={<Sent />} />
      </Routes>
    </AnimatePresence>
  )
}
