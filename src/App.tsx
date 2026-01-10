import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { VendorList } from './pages/VendorList'
import { VendorDetail } from './pages/VendorDetail'
import { AlertsPage } from './pages/AlertsPage'
import { InspectionsPage } from './pages/InspectionsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-green-50 flex">
        <Sidebar />
        <main className="flex-1 ml-72">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendors" element={<VendorList />} />
            <Route path="/vendor/:vendorId" element={<VendorDetail />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/inspections" element={<InspectionsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
