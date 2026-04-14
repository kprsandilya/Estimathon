import { Navigate, Route, Routes } from 'react-router-dom'
import { GameProvider } from './GameProvider'
import ControlPanel from './ControlPanel'
import Scoreboard from './Scoreboard'
import './App.css'

export default function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/control" replace />} />
        <Route path="/display" element={<Scoreboard />} />
        <Route path="/control" element={<ControlPanel />} />
      </Routes>
    </GameProvider>
  )
}
