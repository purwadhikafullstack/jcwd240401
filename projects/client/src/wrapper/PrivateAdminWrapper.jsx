import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from 'axios'
import { useDispatch } from "react-redux";
import { keep } from "../store/reducer/authSlice";
import { remove } from "../store/reducer/authSlice";
import { keepLoginAccount } from '../api/auth'

function PrivateAdminWrapper({allowedRoles}) {
    const token = localStorage.getItem("token");
    const location = useLocation();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const keepLogin = async () => {
    let token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await keepLoginAccount(token)
        if(response.status === 200){
          if (response.data.userId) {
          localStorage.setItem("token", response.data.refreshToken);
          const decoded = jwtDecode(token);
          dispatch(keep(decoded));
        }
      }
      } catch (error) {
        if(error.response.status === 401) {
          dispatch(remove())
          localStorage.removeItem("token")
          console.log(error)
          navigate("/login", { state: {from: location} })
        } else {
          console.log(error)
        }
      }
    }
  };

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace/>;
  } else {
    keepLogin()
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