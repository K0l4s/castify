import { useEffect, useState } from "react";

const useAuthenticate = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    return { isAuthenticated, setIsAuthenticated };
}

export default useAuthenticate;