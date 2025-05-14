import React, { useEffect, useState } from 'react';
import imageSrc from '../assets/allClientImg.jpg';
import NewClientForm from '../components/NewClientForm';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaPlusCircle, FaSearch, FaEdit, FaUserCircle } from 'react-icons/fa';

const Clients = () => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [client, setClient] = useState([]);
  const [companyName, setCompanyName] = useState();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [editClient, setEditClient] = useState(null);

  // Fetch user data & company name
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
          fetchCompanyName(data.email);
        } else {
          console.log("Error:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch company name
  const fetchCompanyName = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:5000/companyName?email=${userEmail}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setCompanyName(data.companyName);
        console.log("Company name is: ", data.companyName);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error fetching company name", error);
    }
  };

  // Fetch clients when companyName is available
  useEffect(() => {
    const fetchData = async () => {
      if (!companyName) return;
      try {
        console.log("Fetching clients for company:", companyName);
        const response = await fetch(`http://localhost:5000/allClientData?companyName=${companyName}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
          setClient(data.data);
          console.log("Clients loaded:", data.data);
        } else {
          console.log("Error: ", data.error);
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
    };

    fetchData();
  }, [companyName]);

  // Filtered client list
  const filteredClients = () => {
    console.log("Client List: ", client);
    console.log("Search Term: ", searchTerm);
    return client.filter((clientItem) =>
      clientItem.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const clientReadMore = (invoiceNumber) => {
    navigate(`/clientReadMore/${invoiceNumber}`, {
      state: { invoiceNumber },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-indigo-400 via-teal-100 to-blue-300">
      <div className={`flex flex-1 ${isFormOpen ? 'filter blur-sm' : ''}`}>
        <Navbar />
        <div className="right w-4/5 h-auto flex flex-col p-6">
          <div className='bg-white/80 p-6 rounded-3xl shadow-xl ml-4 mt-4 mb-0'>
            <h2 className="text-3xl text-blue-700 font-semibold font-serif">
              All Clients
            </h2>
            <p className='mt-2 text-gray-600 text-lg'>
              All Clients associated with the business.
            </p>
          </div>
          <div className='flex justify-self-end mt-0'>
            <button className='group glow-button mt-4 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-lg rounded-lg ml-5 flex items-center gap-5 px-6 py-3' onClick={() => setIsFormOpen(true)}>
              <FaPlusCircle size={22} className='text-blue-600 group-hover:text-white'/>
              Create a New Client
            </button>

            <div className='relative mt-4 ml-5 w-80'>
              <FaSearch className="absolute left-3 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Client Name"
                className="pl-10 pr-3 py-3 w-full bg-white text-md rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 bg-white p-6 w-5/5 ml-5 rounded-lg shadow-md hover:shadow-2xl transition flex flex-col">
            <div className='text-xl font-semibold mb-1 flex gap-3 items-center'>
              <FaUserCircle size={24} className="text-blue-500" />
              <h3>Existing Client</h3>
            </div>

            <div className='max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded-lg'>
              {filteredClients().length > 0 ? (
                filteredClients().map((clientItem, index) => (
                  <div key={index} className="flex flex-col bg-blue-100 mt-4 mb-5 rounded-lg p-4 w-full shadow-sm hover:shadow-lg hover:bg-gray-200 transition">
                    <div className="flex">
                      <p className="text-lg text-gray-700">
                        <span className="font-semibold">Client Name: </span>
                        <strong>{clientItem.fullname}</strong>
                      </p>
                    </div>
                    <div className='mt-4'>
                      <p className='mr-6 text-lg text-gray-700'>
                        <span className="font-semibold">Client Email: </span>
                        <strong>{clientItem.email}</strong>
                      </p>
                    </div>
                    <div className='flex justify-between'>
                      <button className='mt-6 text-lg text-blue-600 cursor-pointer hover:text-green-600 transition' onClick={() => setSelectedClient(clientItem)}>
                        Read more →
                      </button>
                      <div className='flex gap-1 items-center'>
                        <FaEdit size={20} className="mt-6 text-green-600 hover:text-blue-700 cursor-pointer transition" />
                        <button className='mt-6 text-lg text-green-600 cursor-pointer transition' onClick={() => setEditClient(clientItem)}>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 text-lg mt-4">No clients found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedClient && (
        <ClientDetailsModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
      {editClient && (
        <ClientEditModal client={editClient} onClose={() => setEditClient(null)} />
      )}
      <Footer />
      {isFormOpen && <NewClientForm onClose={() => setIsFormOpen(false)} companyName={companyName} />}
    </div>
  );
};

export default Clients;

const ClientDetailsModal = ({ client, onClose }) => {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-xl relative animate-fade-in-up transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-semibold transition"
        >
          &times;
        </button>

        {/* Header */}
        <div className="text-start mb-6">
          <h2 className="text-3xl font-bold text-blue-600">Client Details</h2>
          <p className="text-gray-500 text-sm mt-1">Here are the full client details</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700 text-[1rem]">
          <div className="font-semibold text-gray-600">Full Name:</div>
          <div>{client.fullname}</div>

          <div className="font-semibold text-gray-600">Email:</div>
          <div>{client.email}</div>

          <div className="font-semibold text-gray-600">Phone:</div>
          <div>{client.phone || <span className="italic text-gray-400">Not Available</span>}</div>

          <div className="font-semibold text-gray-600">Client of (company):</div>
          <div>{client.companyName || <span className="italic text-gray-400">Not Available</span>}</div>

        </div>
      </div>
    </div>
  );
};

const ClientEditModal = ({ client, onClose }) => {
  const [fullname,setFullname] = useState(client.fullname);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone);
  const [companyName, setCompanyName] = useState(client.companyName);

  const handleUpdate  = async() => {
    try{
      const response = await fetch("http://localhost:5000/updateClient",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:"include",
        body: JSON.stringify({fullname,email,phone}),
      });

      const data = await response.json();
      if(response.ok){
        console.log("Client updated successfully:", data);
        onClose();
        window.location.reload(); 
      }
      else{
        alert("Error updating client: ",data.error);
      }
    }
    catch(error){
      console.error("Error updating client data:", error);
    }
  }

  if (!client) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-xl relative animate-fade-in-up transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-semibold transition"
        >
          &times;
        </button>

        {/* Header */}
        <div className="text-start mb-6">
          <h2 className="text-3xl font-bold text-blue-600">Edit Client Details</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700 text-[1rem]">
          <div className="font-semibold text-gray-600">Full Name:</div>
          <input
            type="text"
            className="rounded-lg border border-gray-300 p-2 ml-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            defaultValue={client.fullname}
            placeholder="Enter full name"
            onChange={(e) => setFullname(e.target.value)}
          />


          <div className="font-semibold text-gray-600">Email:</div>
          <input
            type="text"
            className="rounded-lg border border-gray-300 p-2 ml-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            defaultValue={client.email}
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="font-semibold text-gray-600">Phone:</div>
          <input
            type="text"
            className="rounded-lg border border-gray-300 p-2 ml-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            defaultValue={client.phone}
            placeholder="Enter Phone Number"
            onChange={(e) => setPhone(e.target.value)}
          />

        </div>
        <div className='flex justify-end mt-10'>
          <button className='bg-blue-600 text-white p-2 rounded-md w-1/3' onClick={handleUpdate}>Save Changes</button>
          </div>
      </div>
    </div>
  );
};
