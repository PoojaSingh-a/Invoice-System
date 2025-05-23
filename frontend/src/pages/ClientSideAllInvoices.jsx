import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import ClientNavbar from '../components/ClientNavbar';
import { FaSearch, FaFileInvoice } from 'react-icons/fa';
import ClientViewMore from '../components/ClientViewMore';

const ClientSideAllInvoices = () => {
  const [email, setEmail] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullInvoice, setShowFullInvoice] = useState(null);
  const [itemList, setItemList] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/clientDashboard", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.email) {
          setEmail(data.email);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!email) return;
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getClientInvoices?email=${email}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };
    fetchInvoices();
  }, [email]);

  const fetchItemList = async (invoiceNumber) => {
    try {
      const response = await fetch(`http://localhost:5000/getEditInvoiceData?invoiceNumber=${invoiceNumber}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setItemList(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching item list:", error);
    }
  };

  useEffect(() => {
    console.log("item list: ", itemList);
  }, [itemList]);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-indigo-400 via-teal-100 to-blue-300 ">
      <div className="flex flex-1">
        <ClientNavbar />
        <div className="w-4/5 p-10">
          <div className="bg-white/80 p-6 rounded-3xl shadow-xl mb-4">
            <h2 className="text-3xl text-blue-700 font-semibold font-serif">All Invoices Issued to you</h2>
            <p className="mt-2 text-gray-600 text-lg">Find all the invoices created till now here.</p>
          </div>
          <div className="relative w-96 mb-6">
            <FaSearch className="absolute left-3 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Invoice Number"
              className="pl-10 pr-3 py-3 w-full bg-white text-md rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center text-xl font-semibold text-blue-800 mb-4 gap-2">
              <FaFileInvoice size={24} />
              <span>Invoices Received</span>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-4">
              {filteredInvoices.length === 0 ? (
                <p className="text-gray-500 text-lg italic">No invoices found for your account.</p>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition hover:bg-gray-100"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-700">
                        Invoice Number : <span className="text-black">{invoice.invoiceNumber || 'N/A'}</span>
                      </p>
                    </div>
                    <p className="text-gray-600">Issued By : {invoice.billedBy || 'N/A'}</p>
                    <div className="flex justify-between mt-3 text-green-500">
                      <span>Issue Date : {new Date(invoice.issueDate).toLocaleDateString()}</span>
                      <span className='text-red-600'>Due Date : {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      <button className="text-blue-700 hover:text-green-600 font-medium"
                        onClick={() => {
                          setShowFullInvoice(invoice);
                          fetchItemList(invoice.invoiceNumber);
                        }}>
                        Read more →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showFullInvoice && (
        <ClientViewMore
          invoice={showFullInvoice}
          itemList={itemList}
          onClose={() => setShowFullInvoice(null)}
        />
      )}
      <Footer />
    </div>
  );
};

export default ClientSideAllInvoices;


