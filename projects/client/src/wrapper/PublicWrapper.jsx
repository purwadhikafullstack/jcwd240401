import { Navigate, Outlet, useLocation } from "react-router";

const PublicWrapper = () => {
    const location = useLocation()
    const token = localStorage.getItem("token");
    return !token ? <Outlet /> : <Navigate to="/" state={{ from: location }} replace />;
};

export default PublicWrapper;