import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { VendorList } from './pages/VendorList'
import { VendorDetail } from './pages/VendorDetail'
import { AlertsPage } from './pages/AlertsPage'
import { InspectionsPage } from './pages/InspectionsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

const Layout = () => {
  return (
    <div className="min-h-screen bg-green-50 flex">
      <Sidebar />
      <main className="flex-1 ml-72">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendor/:vendorId" element={<VendorDetail />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
