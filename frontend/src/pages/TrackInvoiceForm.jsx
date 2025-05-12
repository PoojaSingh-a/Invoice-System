import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const TrackInvoiceForm = () => {
  const [allInvoiceData, setAllInvoiceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

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
          setEmail(data.email); // triggers second useEffect below
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
    if (!email) return;
    const allInvoices = async () => {
      console.log("Fetching all invoices for email: ", email);
      try {
        const response = await fetch(`http://localhost:5000/getTrackInvoicesData?email=${email}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setAllInvoiceData(data.result);
        } else {
          console.log("Error: ", data.error);
        }
      } catch (error) {
        console.error("Error fetching invoice data: ", error);
      }
    };
    allInvoices();
  }, [email]); // this ensures invoices are fetched **only after email is set**


  const filteredInvoices = allInvoiceData.filter((invoice) =>
    invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const invoiceReadMore = (invoiceNumber) => {
    navigate(`/InvoiceReadMore/${invoiceNumber}`);
  };


  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-l from-blue-100 to-blue-300 relative">
      <div className="w-2/3 flex flex-col">
        {/* Heading and Cancel */}
        <div className="flex justify-between items-center mt-8">
          <h3 className="text-3xl font-bold text-blue-700">Track Invoice</h3>
          <a href="#" className="text-red-600 underline text-lg" onClick={() => window.history.back()}>
            Cancel
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white p-4 mt-10 rounded shadow">
          <label htmlFor="search" className="text-base font-medium mr-4">Search by Invoice Number:</label>
          <input
            type="text"
            id="search"
            name="search"
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter Invoice Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Invoice Cards */}
        <div className="flex flex-col mt-8 bg-white p-4 rounded shadow">
          <div className='flex justify-between mb-7 font-semibold'>
            <div className='2/8'>Invoice Number</div>
            <div className='2/8'>Client Name</div>
            <div className='2/8'>Issue Date</div>
            <div className='2/8'>Due Date</div>
            <div className='1/8'>Status</div>
            <div className='1/8'>More</div>
          </div>
          {filteredInvoices.length === 0 ? (
            <p className="text-center text-gray-600 py-4">No invoice found.</p>
          ) : (
            filteredInvoices.map((invoice, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-md p-4 mb-4 hover:shadow-lg transition bg-gradient-to-r from-blue-100 to-blue-50"
              >
                <div className="flex justify-between text-gray-700 font-medium ">
                  <p className='w-2/8'>{invoice.invoiceNumber || 'N/A'}</p>
                  <p className='w-2/8'>{invoice.clientName || 'N/A'}</p>
                  <p className='w-2/8'>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}</p>
                  <p className='w-2/8'>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>

                  <p className="w-1/8 text-green-600">{invoice.status}</p>
                  <button
                    className="w-1/8 text-blue-600 underline hover:font-semibold cursor-pointer"
                    onClick={() => invoiceReadMore(invoice.invoiceNumber)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackInvoiceForm;
