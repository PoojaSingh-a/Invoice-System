import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaUsers, FaFileInvoice, FaDollarSign, FaPaperPlane, FaSave } from 'react-icons/fa';

const Report = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalInvoicesSent, setTotalInvoicesSent] = useState(0);
  const [totalInvoiceSaved, setTotalInvoiceSaved] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentInvoice, setRecentInvoice] = useState(null);
  const [topClient, setTopClient] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);

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
    if (!email) return;
    const fetchReportData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getReportData?email=${email}`);
        const data = await response.json();
        console.log("Data from backend is : ",data);
        if (response.ok) {
          setTotalInvoices(data.totalInvoices);
          setTotalInvoicesSent(data.totalInvoicesSent);
          setTotalInvoiceSaved(data.totalInvoicesSaved);
          setTotalRevenue(data.totalRevenue);
        } else {
          console.log("Error fetching report data:", data.error);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    const fetchRecentInvoice = async () => {
      try {
        const response = await fetch(`http://localhost:5000/recentInvoice?email=${email}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setRecentInvoice(data.invoice);
        } else {
          console.log("Error fetching invoice:", data.error);
          setRecentInvoice(null);
        }
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        setRecentInvoice(null);
      }
    };

    const fetchTopClientAndMonthlyRevenue = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getTopClientAndMonthlyRevenue?email=${email}`);
        const data = await response.json();
        if (response.ok) {
          setTopClient(data.topClients);
          setMonthlyRevenue(data.currentMonthRevenue);
        } else {
          console.log("Error fetching top client and monthly revenue:", data.error);
        }
      } catch (error) {
        console.error("Error fetching top client and monthly revenue:", error);
      }
    };
    fetchReportData();
    fetchRecentInvoice();
    fetchTopClientAndMonthlyRevenue();
  }, [email]);

  return (
    <div className="min-h-screen overflow-auto flex flex-col bg-gradient-to-l from-blue-100 to-blue-300">
      <div className="flex flex-1">
        <Navbar />
        <div className="right w-4/5 h-auto flex flex-col p-8">
          <h2 className="text-black font-bold text-4xl mt-2 ml-5 mb-6">Report</h2>
          <div className='grid grid-cols-3 gap-6 mt-12 mb-10'>
            <ReportCard title="Total Clients" value="45" icon={<FaUsers size={30} />} />
            <ReportCard title="Total Invoices" value={totalInvoices} icon={<FaFileInvoice size={30} />} />
            <ReportCard title="Total Revenue" value={totalRevenue} icon={<FaDollarSign size={30} />} />
            <ReportCard title="Sent Invoices" value={totalInvoicesSent} icon={<FaPaperPlane size={30} />} />
            <ReportCard title="Saved Invoices" value={totalInvoiceSaved} icon={<FaSave size={30} />} />
          </div>
          <Section title="Recent Invoice">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-left shadow-md rounded-lg overflow-hidden">
                <thead className="bg-blue-100 text-gray-700 uppercase text-sm">
                  <tr>
                    <th className="px-6 py-3">Invoice No</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Issue Date</th>
                    <th className="px-6 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {recentInvoice ? (
                    <tr className="hover:bg-blue-50 transition-colors border-b border-gray-200">
                      <td className="px-6 py-4 font-medium text-gray-800">{recentInvoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-gray-700">{recentInvoice.clientName}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold 
                            ${recentInvoice.status === "sent"
                              ? "bg-green-100 text-green-700"
                              : recentInvoice.status === "saved"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {recentInvoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(recentInvoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(recentInvoice.dueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-500 bg-gray-50">
                        No recent invoice found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
          <Section className="bg-white mt-5 p-4 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Top Clients</h2>
            {topClient.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topClient.map((client, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-lg font-medium text-gray-900">{client.clientName}</p>
                    <p className="text-sm text-gray-600">Amount: <span className='text-green-600'>₹{client.totalRevenue}</span></p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No top clients found.</p>
            )}
          </Section>

          <Section className="bg-white mt-5 p-4 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
            <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-md">
              {monthlyRevenue !== null ? (
                <p className="text-lg font-semibold">₹{monthlyRevenue}</p>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </Section>

        </div>
      </div>
      <Footer />
    </div>
  );
};

const ReportCard = ({ title, value, icon }) => (
  <div className='bg-white rounded-lg flex flex-col items-center justify-center p-3'>
    <div className='text-blue-500 mt-2 mb-4 animate-bounce'>{icon}</div>
    <h4 className='text-2xl font-bold text-gray-600'>{title}</h4>
    <p className='text-xl mt-2 text-black font-bold'>{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className='bg-white p-6 rounded-xl shadow-md my-8'>
    <h3 className='text-2xl font-bold mb-6 text-gray-800'>{title}</h3>
    {children}
  </div>
);

export default Report;
