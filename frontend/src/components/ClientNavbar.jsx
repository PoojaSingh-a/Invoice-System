import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const ClientNavbar = () => {
  const navigate = useNavigate();

  const NavigateToHome = () => {
    navigate('/bussinessDashboard');
  };
  const NavigateToInvoice = () => {
    navigate('/allInvoices');
  };
  const NavigateToClient = () => {
    navigate('/allClients');
  };
  const NavigateToReport = () => {
    navigate('/bussinessReport');
  };

  const handleLogout = async () => {
    if(window.confirm("Sure you want to logout?")) {
    try {
      const response = await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      if (response.status === 200) {
        toast.error(response.data.msg);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  }
  };

  return (
    <div className="left w-1/5 h-auto bg-blue-700">
      <h2 className="text-white font-bold text-4xl mt-10 ml-5">Client Dashboard</h2>
      <div className="text-2xl mt-20 ml-7">
        <h3 className="options text-white mt-6 cursor-pointer" onClick={NavigateToHome}>Home</h3>
        <h3 className="options text-white mt-6 cursor-pointer" onClick={NavigateToInvoice}>Contact</h3>
        <h3 className="options text-white mt-6 cursor-pointer" onClick={handleLogout}>Logout</h3>
      </div>
    </div>
  );
};

export default ClientNavbar;
