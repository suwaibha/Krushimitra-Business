import { Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './LandingPage'
import Authentication from './Seller/Authentication'
import BuyerAuthentication from './Buyer/BuyerAuthentication'
import SellerDashboard from './Seller/SellerDashboard'
import BuyerDashboard from './Buyer/BuyerDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Authentication />} />
      <Route path="/buyer-auth" element={<BuyerAuthentication />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
    </Routes>
  )
}

export default App
