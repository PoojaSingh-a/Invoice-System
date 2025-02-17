import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import IndexPage from "./pages/Index";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import BussinessDashboard from "./pages/BussinessDashboard";
import GenerateInvoice from "./pages/GenerateInvoice";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/bussinessDashboard" element={<BussinessDashboard/>} />
        <Route path="/generateInvoice" element={<GenerateInvoice/>} />
      </Routes>
    </Router>
  )
}

export default App
