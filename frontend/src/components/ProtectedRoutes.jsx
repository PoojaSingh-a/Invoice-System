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

    if (isAuthenticated === null) return <p>Loading...</p>; // Show loading while checking auth
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
