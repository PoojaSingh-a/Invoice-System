import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import IndexPage from "./pages/Index";
import BussinessDashboard from "./pages/BussinessDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import GenerateInvoice from "./pages/GenerateInvoice";
import AllInvoices from "./pages/AllInvoices";
import AllClients from "./pages/AllClients";
import BussinessReport from "./pages/BussinessReport";
import EditInvoiceForm from "./pages/EditInvoiceForm";
import InvoiceReadMore from "./pages/InvoiceReadMore";
import TrackInvoiceForm from "./pages/TrackInvoiceForm";
import ProtectedRoutes from "./components/ProtectedRoutes";
import SavedInvoicesPage from "./pages/SavedInvoicesPage";
import ClientSideAllInvoices from "./pages/ClientSideAllInvoices";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/bussinessDashboard" element={<BussinessDashboard />} />
          <Route path="/clientDashboard" element={<ClientDashboard />} />
          <Route path="/generateInvoice" element={<GenerateInvoice />} />
          <Route path="/allInvoices" element={<AllInvoices />} />
          <Route path="/allClients" element={<AllClients />} />
          <Route path="/bussinessReport" element={<BussinessReport />} />
          <Route path="/editInvoiceForm" element={<EditInvoiceForm />} />
          <Route path="/trackInvoiceForm" element={<TrackInvoiceForm />} />
          <Route path="/InvoiceReadMore/:invoiceNumber" element={<InvoiceReadMore />} />
          <Route path="/savedInvoiceForm" element={<SavedInvoicesPage />} />
          <Route path="/ClientSideAllInvoices" element={<ClientSideAllInvoices />} />
        </Route>
      </Routes>
      
      {/* ✅ Global ToastContainer */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;