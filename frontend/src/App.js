import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Productos  from './pages/Productos'
import Clientes   from './pages/Clientes'
import Ventas     from './pages/Ventas'
import Reportes   from './pages/Reportes'
import Navbar     from './components/Navbar'
import { getToken } from './api'

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <>
              <Navbar />
              <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
                <Routes>
                  <Route path="/"          element={<Dashboard />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/clientes"  element={<Clientes />} />
                  <Route path="/ventas"    element={<Ventas />} />
                  <Route path="/reportes"  element={<Reportes />} />
                </Routes>
              </div>
            </>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
