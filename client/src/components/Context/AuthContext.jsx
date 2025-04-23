import { createContext, useContext, useEffect, useState } from "react";
export const useAuth = () => useContext(AuthContext);


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error reading user data from localStorage", error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setLoading(false); // Mark loading as complete whether successful or not
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decodedUser = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem("user", JSON.stringify(decodedUser));
        setUser(decodedUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// export const useAuth = () => useContext(AuthContext);

// import { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         const storedUser = localStorage.getItem("user");

//         if (token && storedUser) {
//             try {
//                 const parsedUser = JSON.parse(storedUser);
//                 setUser(parsedUser); // Set user from localStorage if available
//             } catch (error) {
//                 console.error("Error reading user data from localStorage", error);
//                 // Clean up invalid token/user data
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("user");
//             }
//         }
//     }, []);

//     const login = (token) => {
//         localStorage.setItem("token", token);
//         const decodedUser = JSON.parse(atob(token.split('.')[1]));  // Decode JWT
//         localStorage.setItem("user", JSON.stringify(decodedUser)); // Store user info in localStorage
//         setUser(decodedUser); // Set the user in state
//     };

//     const logout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         setUser(null); // Reset the user state
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);

