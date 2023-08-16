import { Navigate, Outlet, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";

function PrivateSuperAdminWrapper({allowedRoles}) {
    const token = localStorage.getItem("token")
    const profile = jwtDecode(token)
    const location = useLocation()

    return token ? 
    allowedRoles.includes(Number(profile.role)) ? 
    <Outlet /> : <Navigate to="/unauthorized" state={{from: location}} replace /> : <Navigate to="/login" state={{from: location}} replace />
}

export default PrivateSuperAdminWrapper