import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer';
import ClientNavbar from '../components/ClientNavbar';
import { FaSearch, FaFileInvoice } from 'react-icons/fa';
import ClientViewMore from '../components/ClientViewMore';
import { toast,ToastContainer } from 'react-toastify';

const ClientSideDownloadInvoices = () => {
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

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
      toast.error("Error fetching item list:", error);
    }
    };

    const downloadPDF = async (invoiceNumber) => {
        //console.log("Download begin of:", invoiceNumber);
        try {
            const response = await fetch(`http://localhost:5000/downloadPDF?invoiceNumber=${invoiceNumber}`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                const errorText = await response.text(); // ONLY read if response is NOT ok
                console.error("Invoice download failed:", errorText);
               // alert("Failed to download invoice.");
                toast.error("Invoice download failed.");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Invoice_${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Invoice downloaded successfully.");
        } catch (error) {
            console.error("Error while generating PDF", error);
            //alert("Error occurred during download.");
            toast.error("Error occurred during download.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-indigo-400 via-teal-100 to-blue-300 flex flex-col">
            <div className="flex flex-1">
                <ClientNavbar />
                <div className="w-4/5 p-10">
                    <div className="bg-white/80 p-6 rounded-3xl shadow-xl mb-6">
                        <h2 className="text-3xl text-blue-700 font-semibold font-serif">Download your Invoices</h2>
                        <p className="mt-2 text-gray-600 text-lg">Downlaod your invoice from here</p>
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
                        <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-4">
                            <div className='flex gap-40'>
                                <p className='text-gray-500 font-semibold text-xl ml-2'>Invoice Number</p>
                            </div>
                            {filteredInvoices.length === 0 ? (
                                <p className="text-gray-500 text-lg italic">No invoices found for your account.</p>
                            ) : (
                                filteredInvoices.map((invoice, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-200 flex gap-40 rounded-xl p-4 shadow-sm hover:shadow-lg transition hover:bg-gray-100"
                                    >
                                        <p className="font-medium text-gray-700">
                                            <span className="text-black">{invoice.invoiceNumber || 'N/A'}</span>
                                        </p>
                                        <button className="text-blue-700 hover:text-green-600 font-medium"
                                            onClick={() => {
                                                downloadPDF(invoice.invoiceNumber);
                                            }}>
                                            Download PDF
                                        </button>
                                        <button className='text-red-500 underline hover:text-green-500'
                                            onClick={() => {
                                                setShowFullInvoice(invoice);
                                                fetchItemList(invoice.invoiceNumber);
                                            }}>
                                            View
                                        </button>
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
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
        </div>
    );
}

export default ClientSideDownloadInvoices
