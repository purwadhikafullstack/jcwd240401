import { useLocation, Navigate, Outlet } from "react-router-dom";
import jwtDecode from "jwt-decode";

function PrivateAdminWrapper({allowedRoles}) {
    const token = localStorage.getItem("token");
    const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const profile = jwtDecode(token);

    if (allowedRoles.includes(Number(profile.role))) {
      return <Outlet />;
    } else {
      return (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
      );
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to="/login" />;
  }
}

export default PrivateAdminWrapper