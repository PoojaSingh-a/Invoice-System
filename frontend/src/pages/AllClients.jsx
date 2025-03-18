import React, { useEffect, useState } from 'react';
import imageSrc from '../assets/allClientImg.jpg';
import NewClientForm from '../components/NewClientForm';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Clients = () => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [client, setClient] = useState([]);
  const [companyName, setCompanyName] = useState();
  const [isFormOpen, setIsFormOpen] = useState(false);

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

    const fetchData = async (userEmail) => {
      //console.log("Company name is: ",companyName);
      try {
        const response = await fetch(`http://localhost:5000/allClientData?companyName=${companyName}`, {
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
  },[companyName]);

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

  return (
    <div className="h-screen overflow-auto flex flex-col bg-gradient-to-l from-blue-100 to-blue-300">
      <div className={`flex flex-1 ${isFormOpen ? 'filter blur-sm' : ''}`}>
        <Navbar />
        <div className="right w-4/5 h-auto flex flex-col">
          <h2 className="text-black font-bold text-3xl mt-12 ml-5">
            {name ? `Welcome, ${name}` : "Loading..."}
          </h2>

          <div className="flex gap-20 mt-10 flex-col ml-20">
            <div className="mt-10 bg-white p-3 w-2/3 rounded-md flex justify-between shadow-md hover:shadow-2xl">
              <div className="text-xl font-semibold">Want to create a New Client?</div>
              <div className="text-red-500 hover:text-blue-600 hover:underline text-center text-base hover:cursor-pointer" onClick={() => setIsFormOpen(true)}>
                Click here
              </div>
            </div>
            <div className='bg-white w-2/3 rounded-lg p-5 flex flex-col shadow-lg hover:shadow-2xl'>
              <div className='text-xl font-semibold mb-5'>Existing Client</div>
              {client.length > 0 ? (
                <Swiper
                  modules={[Pagination]}
                  spaceBetween={30}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  className="w-full"
                >
                  {client.map((clientItem, index) => (
                    <SwiperSlide key={index}>
                      <div className="mt-5 w-full bg-blue-50 p-5 rounded-lg flex justify-between">
                        <div>
                          <div className="flex">
                            <div>Client Name</div>
                            <div className="ml-3 font-bold">{clientItem.fullname}</div>
                          </div>
                          <div className="flex mt-4">
                            <div>Client Email</div>
                            <div className="ml-3 text-blue-600">{clientItem.email}</div>
                          </div>
                          <button className="text-green-500 font-bold mt-5 text-base">Edit</button>
                        </div>
                        <div className="flex flex-col text-right">
                          <div>Phone</div>
                          <div className="mt-3 text-blue-600">{clientItem.phone}</div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="mt-10 bg-white p-4 w-2/3 rounded-lg flex justify-center text-gray-500">
                  <p>No Client data found!</p>
                </div>
              )}
              <p className='text-center mt-5 text-red-500'>Swipe Right for more</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {isFormOpen && <NewClientForm onClose={() => setIsFormOpen(false)} companyName={companyName} />}
    </div>
  );
};

export default Clients;
