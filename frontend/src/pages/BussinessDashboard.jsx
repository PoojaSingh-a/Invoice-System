import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BussinessDashboard = () => {
  const [name,setName] = useState(null);
  const navigate = useNavigate();
  
  useEffect(()=>{
    const fetchUserData = async() => {
      try{
        const response = await fetch("http://localhost:5000/bussinessDashboard",{
          method:"GET",
          credentials:"include",
        });
        const data = await response.json();
        if(response.ok){
          setName(data.name);
        }
        else{
          console.log("Error: ",data.error);
        }
      }
      catch(error){
        console.error("Error fetching user data: ",error);
      }
    }
    fetchUserData();
  },[]);

  const GenerateInvoiceForm = () => {
    console.log("pressed");
    navigate("/generateInvoice");
  };

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
            <h3 className="options text-white mt-6 cursor-pointer" >Logout</h3>
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
              <button className="glow-button mt-10 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-xl rounded-lg ml-10">
                Edit Invoice
              </button>
              <button className="glow-button mt-10 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-xl rounded-lg ml-10">
                Track Invoice
              </button>
            </div>
            <div className="bg-white mt-20 rounded-lg p-6 w-1/2 max-w-[600px] shadow-lg hover:shadow-xl transition duration-300">
              <h6 className='text-lg font-bold text-gray-800 mb-4 border-b pb-2'>Recently Created Invoice</h6>
              <div className='flex justify-between'>
                <p className='mt-6 text-lg text-gray-700'><span className="font-semibold">Invoice Number:</span> DBseAAega</p>
                <p className='mt-6 mr-6 text-lg text-gray-700'><span className="font-semibold">Invoice Title:</span> <strong> DBseAAega</strong></p>
              </div>
              <p className='mt-4 text-lg text-gray-700'><span className="font-semibold">Invoice Amount:</span> <span className='text-green-600 font-bold'>$ DBseAAega</span></p>
              <p className='mt-6 text-lg text-red-500 cursor-pointer hover:text-red-600 transition'>Read more...</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BussinessDashboard;
