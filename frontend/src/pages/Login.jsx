import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with:", email, password); 
    
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password })
      });
  
      console.log("Response received:", response);  // Check if response is received
  
      const data = await response.json();
      console.log("Response data:", data);  // Check the data from backend
  
      if (response.ok) {
        alert(data.msg); 
        //userType is either 1 or 0 stored in db at the time of registeration
        if(data.usertype === 1){
          //If user is bussiness
          navigate('/bussinessDashboard'); 
        }else{
          //if user is client then
          navigate('clientDashboard'); 
        }
      } else {
        alert(data.err);
      }
    } catch (err) {
      console.log("error: ", err);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center bg-red-200 p-3'>
        <input type="text" placeholder='email' className='mt-3 p-2 rounded-md' value={email} onChange={(e)=>{
          setEmail(e.target.value);
        }}/>
        <input type="password" placeholder='password' className='mt-3 p-2 rounded-md' value={password} onChange={(e)=>{
          setPassword(e.target.value);
        }}/>
        <button className='w-auto bg-blue-600 mt-4 p-3 rounded-md'>Submit</button>
      </form>
    </div>
  )
}

export default Login
