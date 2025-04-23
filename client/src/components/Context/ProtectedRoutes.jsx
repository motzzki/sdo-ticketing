import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; // Ensure the correct path


const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    // If there's no user or user is null, redirect to login
    if (!user || user === null) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
};

export default ProtectedRoute;

// export default ProtectedRoute;

// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//     const { user } = useAuth();

//     // Show loading while the user is being fetched
//     if (user === null) {
//         return <Navigate to="/" />;
//     }

//     if (!user) {
//         // Redirect to login if not authenticated
//         return <Navigate to="/forbidden" />;
//     }

//     if (!allowedRoles.includes(user.role)) {
//         // Redirect to forbidden if the user's role is not allowed
//         return <Navigate to="/forbidden" />;
//     }

//     return children;
// };

// export default ProtectedRoute;
