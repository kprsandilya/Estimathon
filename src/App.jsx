import { Navigate, Route, Routes } from 'react-router-dom'
import AdminGate from './AdminGate'
import ControlPanel from './ControlPanel'
import { GameProvider } from './GameProvider'
import JoinTeam from './JoinTeam'
import Scoreboard from './Scoreboard'
import './App.css'

export default function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/display" replace />} />
        <Route path="/join" element={<JoinTeam />} />
        <Route path="/display" element={<Scoreboard />} />
        <Route
          path="/control"
          element={
            <AdminGate>
              <ControlPanel />
            </AdminGate>
          }
        />
      </Routes>
    </GameProvider>
  )
}
