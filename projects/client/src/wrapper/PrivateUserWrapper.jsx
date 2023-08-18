import { useLocation, Outlet, Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const PrivateUserWrapper = ({allowedRoles}) => {
    const token = localStorage.getItem("token")
    const profile = jwtDecode(token)
    const location = useLocation()

    return token ? 
    allowedRoles.includes(Number(profile.role)) ? 
    <Outlet /> : <Navigate to="/unauthorized" state={{from: location}} replace /> : <Navigate to="/login" state={{from: location}} replace />
}

export default PrivateUserWrapper