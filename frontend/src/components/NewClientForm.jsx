import React, { useState } from "react";

const NewClientForm = ({ onClose,companyName }) => {
  const [formData,setFormData] = useState({
    fullname:"",
    email:"",
    phone:"",
    companyName:companyName, 
  });
  const handleChange = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const response = await fetch("http://localhost:5000/createClient",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(formData),
      });

      const data = await response.json();
      if(response.ok){
        alert("Client created succesfully!");
        onClose();
      }
      else{
        alert(`Error: ${data.error}`);
      }
    }
    catch(error){
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Create a New Client</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-gray-700 font-semibold" >Full Name</label>
            <input type="text" name="fullname" className="w-full p-2 border rounded" value={formData.fullname} onChange={handleChange}/>
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 font-semibold">Email</label>
            <input type="email" name="email" className="w-full p-2 border rounded" value={formData.email} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700 font-semibold">Phone</label>
            <input type="tel" name="phone" className="w-full p-2 border rounded" value={formData.phone} onChange={handleChange}/>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="px-4 py-2 text-red-600 underline rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientForm;
