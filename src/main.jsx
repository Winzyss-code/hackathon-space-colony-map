import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/HexStructure'
import SpaceColonyMap from './components/SpaceColonyMap'
import SpaceColonyFusion from './components/SpaceColonyFusion'
import Map from './components/Map'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Map/>
  </StrictMode>,
)
