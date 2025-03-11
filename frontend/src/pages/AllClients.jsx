import React, { useEffect, useState } from 'react';
import imageSrc from '../assets/allClientImg.jpg';
import NewClientForm from '../components/NewClientForm'; 

const Clients = () => {
  const [client, setClient] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false); //State to toggle form

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/allClientData", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setClient(data.data);
        } else {
          console.log("Error: ", data.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-l from-blue-100 to-blue-300 relative">
      <div className="flex">
        {/* Right Section */}
        <div className="w-2/3">
          <div className='flex justify-between w-4/5'>
            <div className="text-3xl text-blue-700 font-bold mt-8 ml-32">All Clients</div>
            <div className='text-red-500 text-xl mt-8 hover:underline hover:cursor-pointer' onClick={() => window.history.back()}>Cancel</div>
          </div>

          <div className='mt-16 ml-32 bg-white p-3 w-2/3 rounded-md flex justify-between'>
            <div className='text-xl font-bold'>Want to create a New Client?</div>
            <div
              className='text-red-500 hover:text-blue-600 hover:underline text-center text-base hover:cursor-pointer'
              onClick={() => setIsFormOpen(true)}
            >
              Click here
            </div>
          </div>

          {client.length > 0 ? (
            client.map((client, index) => (
              <div key={index} className='mt-10 bg-white p-4 w-2/3 ml-32 rounded-lg flex justify-between'>
                <div>
                  <div className='flex'>
                    <div className=''>Client Name</div>
                    <div className='ml-3 font-bold'>{client.fullname}</div>
                  </div>
                  <div className='flex mt-4'>
                    <div className=''>Client Email</div>
                    <div className='ml-3 text-blue-600'>{client.email}</div>
                  </div>
                  <div>
                   <button className='text-green-500 font-bold mt-5 text-base'>Edit</button>
                  </div>
                </div>
                <div className='flex flex-col'>
                  <div className='font-bold'>Phone</div>
                  <div className='mt-3 text-end text-blue-600'>{client.phone}</div>
                </div>
              </div>
            ))
          ) : (
            <div className='mt-10 bg-white p-4 w-2/3 ml-32 rounded-lg flex justify-between'>
              <p>No Client data found!</p>
            </div>
          )}
        </div>

        {/* Left Section */}
        <div className="w-1/3 bg-blue-500 rounded-l-full pl-14 shadow-md">
          <img src={imageSrc} alt="Clients" className="w-full min-h-screen rounded-l-full" />
        </div>
      </div>

      {/* Render the form when isFormOpen is true */}
      {isFormOpen && <NewClientForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default Clients;
