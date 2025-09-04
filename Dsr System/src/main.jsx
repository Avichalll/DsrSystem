import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DSRForm from './components/DSRForm.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <DSRForm/>
  </StrictMode>,
)
