import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{
    if(location.state?.message){
      toast.error(location.state.message, { autoClose: 1000 });
    }
  },[location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted : ", email, password);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Response data : ", data);

      if (response.ok) {
        toast.success(data.msg);  
        setTimeout(() => {
          if (parseInt(data.usertype) === 1) {
            navigate("/bussinessDashboard");
          } else {
            navigate("/clientDashboard");
          }
        }, 1000);
      } else {
        toast.error(data.err); 
      }
    } catch (err) {
      console.log("Error: ", err);
      toast.error("Something went wrong. Please try again!"); 
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center bg-red-200 p-3"
      >
        <input
          type="text"
          placeholder="email"
          className="mt-3 p-2 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          className="mt-3 p-2 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-auto bg-blue-600 mt-4 p-3 rounded-md" type="submit">
          Submit
        </button>
      </form>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
