import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import ClientNavbar from '../components/ClientNavbar';
import { FaSearch, FaFileInvoice } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

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
    <div className="min-h-screen bg-gradient-to-tr from-indigo-400 via-teal-100 to-blue-300 flex flex-col">
      <div className="flex flex-1">
        <ClientNavbar />
        <div className="w-full px-8 py-6">
          <div className="bg-white/90 p-6 rounded-3xl shadow-xl mb-6">
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
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-4">
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
                    <div className="flex justify-between mt-3 text-green-600">
                      <span>Amount : ₹{invoice.totalAmount || 0}</span>
                      <span>Date {new Date(invoice.issueDate).toLocaleDateString()}</span>
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
        <FullInvoiceModal
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

const FullInvoiceModal = ({ invoice, itemList, onClose }) => {
  const calculateTotals = () => {
    let subTotal = 0;
    let gstTotal = 0;
    itemList.forEach(item => {
      const lineTotal = item.itemRate * item.itemQty;
      subTotal += lineTotal;
      gstTotal += lineTotal * (item.itemGST / 100);
    });
    const grandTotal = subTotal + gstTotal;
    return { subTotal, gstTotal, grandTotal };
  };

  if (!invoice) return null;

  const { subTotal, gstTotal, grandTotal } = calculateTotals(); // ✅ Call it here

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-2xl"
        >
          <IoClose />
        </button>
        <h3 className="text-2xl font-bold text-blue-700 mb-6">Invoice Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Biller Details</h5>
            <p>Name: {invoice.billedBy}</p>
            <p>Company: {invoice.billerCompany}</p>
            <p>Phone: {invoice.billerPhone}</p>
            <p>City: {invoice.billerCity}</p>
          </div>
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Client Details</h5>
            <p>Name: {invoice.clientName}</p>
            <p>Email: {invoice.clientEmail}</p>
          </div>
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Dates & Number</h5>
            <p>Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p>Invoice No: {invoice.invoiceNumber}</p>
          </div>
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Totals</h5>
            <p>Subtotal: ₹{subTotal.toFixed(2)}</p>
            <p>GST Total: ₹{gstTotal.toFixed(2)}</p>
            <p>Total Amount: ₹{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-200">
                {['Description', 'Rate', 'Qty', 'Line Total', 'GST'].map(col => (
                  <th key={col} className="px-3 py-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemList.length > 0 ? (
                itemList.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-3 py-2">{item.itemDesc}</td>
                    <td className="px-3 py-2">₹{item.itemRate}</td>
                    <td className="px-3 py-2">{item.itemQty}</td>
                    <td className="px-3 py-2">₹{(item.itemRate * item.itemQty).toFixed(2)}</td>
                    <td className="px-3 py-2">₹{((item.itemRate * item.itemQty) * (item.itemGST / 100)).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No items available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

