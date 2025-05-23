import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import ClientNavbar from '../components/ClientNavbar';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { FaRegFolderOpen, FaDownload, FaEnvelopeOpenText} from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import { BsCardList } from 'react-icons/bs';
import ClientViewMore from '../components/ClientViewMore';

const ClientDashboard = () => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [recentInvoice, setRecentInvoice] = useState(null);
  const [showFullInvoice, setShowFullInvoice] = useState(null);
  const [itemList, setItemList] = useState([]);
  const navigate = useNavigate();

  const fetchRecentInvoice = async () => {
    try {
      const res = await fetch(`http://localhost:5000/recentInvoiceIssued?email=${email}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setRecentInvoice(data.invoice);
      } else {
        setRecentInvoice(null);
      }
    } catch (error) {
      setRecentInvoice(null);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/clientDashboard", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        console.log("Client dashboard user is : ",data);
        if (res.ok) {
          setName(data.name);
          setEmail(data.email);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
    fetchRecentInvoice();
  }, [email]);

  const navigateTo = (path) => navigate(path);

  const downloadInvoice = () => {
    if (!recentInvoice) return;
    window.open(`http://localhost:5000/downloadInvoice/${recentInvoice.invoiceNumber}`, "_blank");
  };

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

  const getStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due >= now ? 'Pending' : 'Overdue';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-indigo-400 via-teal-100 to-blue-300">
      <div className="flex flex-1">
        <ClientNavbar />
        <div className="w-4/5 p-10">
          {/* Greeting */}
          <div className="bg-white/80 p-6 rounded-3xl shadow-xl mb-10">
            <h2 className="text-3xl font-extrabold text-blue-700 font-serif">Welcome, {name || "Client"} 👋</h2>
            <p className="mt-2 text-gray-600 text-lg">Welcome back to your client dashboard. Manage your invoices efficiently.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Action Buttons */}
            <div className="flex flex-col gap-6 w-full lg:w-1/2">
              <button
                className="group flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md"
                onClick={() => navigateTo("/ClientSideAllInvoices")}
              >
                <FaRegFolderOpen size={22} className="text-blue-600 group-hover:text-white" />
                View All Invoices
              </button>

              <button
                className="group flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md"
                onClick={() => navigateTo("/downloadInvoices")}
              >
                <FaDownload size={22} className="text-blue-600 group-hover:text-white" />
                Download Invoice
              </button>
            </div>

            {/* Recent Invoice */}
            <div className="bg-white rounded-3xl border border-purple-200 p-6 w-full lg:w-1/2 shadow-lg">
              <h6 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2 flex items-center gap-2">
                <BsCardList className="text-blue-700" size={22}/> Recently Issued Invoice
              </h6>
              {recentInvoice ? (
                <>
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold">Invoice:</span> {recentInvoice.invoiceNumber}
                  </p>
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold">Client:</span> {recentInvoice.clientName}
                  </p>
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold">Due Date:</span>{" "}
                    <span className="text-red-600">{new Date(recentInvoice.dueDate).toLocaleDateString()}</span>
                  </p>
                  <p className="mt-2 text-gray-700 flex items-center gap-2">
                    <span className='font-bold'>Status: </span>
                    <span className='flex items-center gap-2'>
                      {getStatus(recentInvoice.dueDate) === 'Overdue' ? (
                        <>
                        <FiAlertCircle className='text-red-600'/>
                        <span className='text-red-600 font-semibold'>Overdue</span>
                        </>
                      ) : (
                        <span className='text-green-500 font-semibold'>Pending</span>
                      )}
                    </span>
                  </p>
                  <p
                    className="mt-4 text-md text-indigo-700 hover:text-green-700 cursor-pointer font-semibold"
                    onClick={() => {
                          setShowFullInvoice(recentInvoice);
                          fetchItemList(recentInvoice.invoiceNumber);
                        }}
                  >
                    View More →
                  </p>
                </>
              ) : (
                <p className="text-gray-500 mt-10 text-center">No recent invoice found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
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

export default ClientDashboard;

