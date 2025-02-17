import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import IndexPage from "./pages/Index";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import BussinessDashboard from "./pages/BussinessDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import GenerateInvoice from "./pages/GenerateInvoice";
import AllInvoices from "./pages/AllInvoices";
import AllClients from "./pages/AllClients";
import BussinessReport from "./pages/BussinessReport";
const App = () => {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/bussinessDashboard" element={<BussinessDashboard/>}/>
        <Route path="/clientDashboard" element={<ClientDashboard/>}/>
        <Route path="/generateInvoice" element={<GenerateInvoice/>}/>
        <Route path="/allInvoices" element={<AllInvoices/>}/>
        <Route path="/allClients" element={<AllClients/>}/>
        <Route path="/bussinessReport" element={<BussinessReport/>}/>
      </Routes>
    </Router>
  )
}

export default App
