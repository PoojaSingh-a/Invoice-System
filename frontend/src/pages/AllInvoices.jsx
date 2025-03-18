import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

const Invoices = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();

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
  })
  return (
    <div className="h-screen overflow-auto flex flex-col bg-gradient-to-l from-blue-100 to-blue-300">
      <div className="flex flex-1">
        <Navbar />
        <div className="right w-4/5 h-auto flex flex-col">
          <h2 className="text-black font-bold text-3xl mt-12 ml-5">
          {name ? `Welcome, ${name}` : "Loading..."}
          </h2>
        </div>
      </div>
    </div>
  )
}

export default Invoices
