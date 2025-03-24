import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer';
import { FaFileInvoice, FaPlusCircle } from 'react-icons/fa'; // Icons
import { FaEdit } from 'react-icons/fa';

const Invoices = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [invoices, setInvoices] = useState([]);

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

  const fetchAllInvoiceCreated = async () => {
    try {
      console.log("Email is : ", email);
      const response = await fetch(`http://localhost:5000/allInvoicesCreated?email=${email}`, {
        method: "GET",
        credentials: "include",
      });

      const invoiceData = await response.json();
      if (response.ok) {
        setInvoices(invoiceData.data);
        console.log(invoices);
      } else {
        console.log("Error fetching invoice:", invoiceData.error);
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (email) {
      fetchAllInvoiceCreated();
    }
  }, [email]);

  return (
    <div className="h-screen overflow-auto flex flex-col bg-gradient-to-l from-blue-100 to-blue-300">
      <div className="flex flex-1">
        <Navbar />
        <div className="right w-4/5 h-auto flex flex-col p-6">
          <h2 className="text-black font-bold text-3xl mt-5 ml-5">
            {name ? `Welcome, ${name}` : "Loading..."}
          </h2>
          <button className="glow-button mt-14 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-lg rounded-lg ml-10 flex items-center gap-5 px-6 py-3">
            <FaPlusCircle size={22} />
            Create a New Invoice
          </button>
          <div className="mt-10 bg-white p-6 w-3/4 ml-10 rounded-lg shadow-md hover:shadow-2xl transition flex flex-col">
            <div className="text-xl font-semibold mb-4 flex gap-3 items-center">
              <FaFileInvoice size={24} className="text-blue-500" />
              <h3> Existing Invoices </h3>
            </div>
            <div className='max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded-lg'>
              {invoices.length > 0 ? (
                invoices.map((invoice, index) => (
                  <div key={index} className='bg-blue-100 mt-4 mb-5 rounded-lg p-4 w-full shadow-sm hover:shadow-lg hover:bg-gray-200 transition'>
                    <div className='flex justify-between'>
                      <p className='text-lg text-gray-700'>
                        <span className='font-semibold'>Invoice Number </span>
                        <strong>{invoice.invoiceNumber}</strong>
                      </p>
                    </div>
                    <p className='mr-6 text-lg text-gray-700'>
                      <span className="font-semibold">Client Name </span>
                      <strong>{invoice.clientName}</strong>
                    </p>
                    <div className='flex justify-between'>
                    <p className='mt-6 text-lg text-blue-600 cursor-pointer hover:text-green-600 transition'>
                      Read more →
                    </p>
                    <div className='flex gap-1 items-center'>
                    <FaEdit size={20} className="mt-6 text-green-600 hover:text-blue-700 cursor-pointer transition" />
                    <p className='mt-6 text-lg text-green-600 cursor-pointer transition'>
                      Edit
                    </p>
                    </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 text-lg mt-4">No invoices available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Invoices
