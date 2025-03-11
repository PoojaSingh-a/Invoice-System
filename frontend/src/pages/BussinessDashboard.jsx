import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BussinessDashboard = () => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [recentInvoice, setRecentInvoice] = useState(null);
  const navigate = useNavigate();

  const fetchRecentInvoice = async () => {
    try {
      const invoiceResponse = await fetch(`http://localhost:5000/recentInvoice?email=${email}`, {
        method: "GET",
        credentials: "include",
      });

      const invoiceData = await invoiceResponse.json();
      if (invoiceResponse.ok) {
        setRecentInvoice(invoiceData.invoice);  // Ensure correct access
      } else {
        console.log("Error fetching invoice:", invoiceData.error);
        setRecentInvoice(null);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      setRecentInvoice(null);
    }
  };

  // Fetch user and invoice data inside useEffect
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/bussinessDashboard", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setName(data.name);
          setEmail(data.email);
        } else {
          console.log("Error:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Call `fetchRecentInvoice` when `name` is set
  useEffect(() => {
    if (name) {
      fetchRecentInvoice();
    }
  }, [name]); // Runs when `name` is updated


  const GenerateInvoiceForm = () => {
    console.log("pressed");
    navigate("/generateInvoice");
  };

  const EditInvoiceForm = async () => {
    navigate("/editInvoiceForm");
  }

  const NavigateToHome = () => {
    navigate('/bussinessDashboard');
  };
  const NavigateToInvoice = () => {
    navigate('/allInvoices');
  };
  const NavigateToClient = () => {
    navigate('/allClients');
  };
  const NavigatetoReport = () => {
    navigate('/bussinessReport');
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
  
      if (response.status === 200) {
        toast.error(response.data.msg);
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };
  
  const invoiceReadMore = async () => {
    navigate(`/InvoiceReadMore/${recentInvoice.invoiceNumber}`);
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-l from-blue-100 to-blue-300">
      <div className="flex flex-1">
        <div className="left w-1/5 h-auto bg-blue-700">
          <h2 className="text-white font-bold text-4xl mt-10 ml-5">Dashboard</h2>
          <div className="text-2xl mt-20 ml-7">
            <h3 className="options text-white mt-6 cursor-pointer" onClick={NavigateToHome}>Home</h3>
            <h3 className="options text-white mt-6 cursor-pointer" onClick={NavigateToInvoice}>Invoices</h3>
            <h3 className="options text-white mt-6 cursor-pointer" onClick={NavigateToClient}>Clients</h3>
            <h3 className="options text-white mt-6 cursor-pointer" onClick={NavigatetoReport}>Report</h3>
            <h3 className="options text-white mt-6 cursor-pointer" onClick={handleLogout}>Logout</h3>
          </div>
        </div>
        <div className="right w-4/5 h-auto flex flex-col">
          <h2 className="text-black font-bold text-3xl mt-12 ml-5">
            {name ? `Welcome, ${name}` : "Loading..."}
          </h2>

          <div className="flex gap-20 mt-10">
            <div className="flex flex-col">
              <button className="glow-button mt-20 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-xl rounded-lg ml-10" onClick={GenerateInvoiceForm}>
                Create a New Invoice
              </button>
              <button className="glow-button mt-10 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-xl rounded-lg ml-10" onClick={EditInvoiceForm}>
                Edit Invoice
              </button>
              <button className="glow-button mt-10 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-xl rounded-lg ml-10">
                Track Invoice
              </button>
            </div>
            <div className="bg-white mt-20 rounded-lg p-6 w-1/2 max-w-[600px] shadow-lg hover:shadow-xl transition duration-300">
              <h6 className='text-lg font-bold text-gray-800 mb-4 border-b pb-2'>Recently Created Invoice</h6>
              {recentInvoice ? (
                <>
                  <div className='flex justify-between'>
                    <p className='mt-6 text-lg text-gray-700'><span className="font-semibold">Invoice Number:</span>{recentInvoice.invoiceNumber} </p>
                    <p className='mt-6 mr-6 text-lg text-gray-700'><span className="font-semibold">Client Name:</span> <strong> {recentInvoice.clientName}</strong></p>
                  </div>
                  <p className='mt-4 text-lg text-gray-700'>
                    <span className="font-semibold">Due Date:</span>{" "}
                    <span className='text-red-600 font-bold'>
                      {new Date(recentInvoice.dueDate).toISOString().split('T')[0]}
                    </span>
                  </p>

                  <p className='mt-6 text-lg text-green-500 cursor-pointer font-bold hover:text-green-600 transition' onClick={invoiceReadMore}>Read more</p>
                </>
              ) : (
                <p className='text-gray-500 flex justify-center items-center mt-16'>No recent Invoice Found</p>
              )}</div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </div>
  );
};

export default BussinessDashboard;
