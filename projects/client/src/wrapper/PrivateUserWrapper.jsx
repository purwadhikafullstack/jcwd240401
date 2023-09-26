import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from 'axios'
import { useDispatch } from "react-redux";
import { keep } from "../store/reducer/authSlice";
import { remove } from "../store/reducer/authSlice";
import { keepLocation } from "../store/reducer/locationSlice";
import { keepLoginAccount } from "../api/auth"
import { getMainAddress } from "../api/profile"

const PrivateUserWrapper = ({allowedRoles}) => {
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

  const getAddress = async () => {
    const token = localStorage.getItem("token")
    try {
        const response = await getMainAddress(token)
        if (response.data) {
          dispatch(keepLocation({ city: response.data.data?.City?.city_name, province: response.data.data?.City?.Province?.province_name, latitude: response.data.data?.latitude, longitude: response.data.data?.longitude }))
        }
    } catch (error) {
        console.error(error)
        if (error.response) {
            console.error(error.response.message)
        }
    }
}

  if (!token) {
    if(location.pathname.includes("my-address") || location.pathname.includes("my-profile")){
      return <Navigate to="/user/account" />
    } else if(location.pathname.includes("payment") || location.pathname.includes("checkout")){
      return <Navigate to="/user/orders" />
    } else {
      return <Outlet />;
    }
  } else {
    keepLogin()
    getAddress()
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

export default PrivateUserWrapper