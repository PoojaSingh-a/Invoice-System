import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Null means "checking auth"

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("http://localhost:5000/check-auth", {
                    method: "GET",
                    credentials: "include", // IMPORTANT to send cookies
                });

                const data = await response.json();
                if (data.authenticated) {
                    setIsAuthenticated(true);
                } else {
                    
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) { 
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-700 text-xl mt-3 font-semibold">Loading...</p>
              </div>
            </div>
          );
    } 
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{message:"You must Log in first!"}}/>;
};

export default ProtectedRoute;
