import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { FaPlusCircle, FaEdit} from 'react-icons/fa'; // for icons
import { MdTrackChanges } from 'react-icons/md';
import {FaRegFolderOpen} from 'react-icons/fa';
import {BsCardList} from 'react-icons/bs';

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
        setRecentInvoice(invoiceData.invoice);  
      } else {
        console.log("Error fetching invoice:", invoiceData.error);
        setRecentInvoice(null);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      setRecentInvoice(null);
    }
  };

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

  useEffect(() => {
    if (name) {
      fetchRecentInvoice();
    }
  }, [name]);

  const GenerateInvoiceForm = () => {
    navigate("/generateInvoice");
  };

  const EditInvoicePage = async () => {
    navigate("/editInvoiceForm");
  }

  const TrackInvoicePage = async() => {
    navigate("/trackInvoiceForm");
  }

  const SavedInvoicesPage = async() => {
    navigate("/savedInvoiceForm");
  }

  const invoiceReadMore = async () => {
    navigate(`/InvoiceReadMore/${recentInvoice.invoiceNumber}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-indigo-400 via-teal-100 to-blue-300">
      <div className="flex flex-1">
        <Navbar />
        <div className="right w-4/5 p-10 ">
        <div className='bg-white/80 p-6 rounded-3xl shadow-xl mb-10'>
          <h2 className="text-3xl text-blue-700 font-semibold font-serif ">
            {name ? `Welcome, ${name}` : "Loading..."} 👋
          </h2>
          <p className='mt-2 text-gray-600 text-lg'>Welcome back to your dashboard. Manage your invoices efficiently.</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex flex-col gap-6 w-full lg:w-1/2">
              <button className="group flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md" onClick={GenerateInvoiceForm}>
                <FaPlusCircle className='text-blue-600 group-hover:text-white ' size={22}/>
                <h2>Create a New Invoice</h2>
              </button>
              <button className="group flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md" onClick={EditInvoicePage}>
               <FaEdit className='text-blue-600 group-hover:text-white' size={20}/>
                <h2> Edit Invoice</h2>
              </button>
              <button className="group flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md" onClick={SavedInvoicesPage}>
              <FaRegFolderOpen  className='text-blue-600 group-hover:text-white' size={24}/>
               <h2>Saved Invoices</h2>
              </button>
              <button className="group flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md" onClick={TrackInvoicePage}>
              <MdTrackChanges className='text-blue-600 group-hover:text-white' size={24}/>
               <h2>Track Invoice</h2>
              </button>              
            </div>
            <div className="bg-white rounded-3xl border border-blue-600 p-6 w-full lg:w-1/2 shadow-lg">
              <h6 className='text-lg font-bold text-blue-700 mb-4 border-b pb-2 flex items-center gap-2'>
                <BsCardList className="text-blue-700 text-xl" size={22} />
                Recently Created Invoice</h6>
              {recentInvoice ? (
                <>
                  <div className='flex justify-between'>
                    <p className='mt-6 text-lg text-gray-700'><span className="font-semibold">Invoice Number:</span>{recentInvoice.invoiceNumber} </p>
                    <p className='mt-6 mr-6 text-lg text-gray-700'><span className="font-semibold">Client Name:</span> <strong> {recentInvoice.clientName}</strong></p>
                  </div>
                  <p className='mt-4 text-lg text-gray-700'>
                    <span className=" ">Due Date:</span>{" "}
                    <span className='text-red-600  '> 
                      {new Date(recentInvoice.dueDate).toISOString().split('T')[0]}
                    </span>
                  </p>
                  <p className='mt-20 text-lg text-blue-600 cursor-pointer hover:text-green-600 transition' onClick={invoiceReadMore}>Read more →</p>
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