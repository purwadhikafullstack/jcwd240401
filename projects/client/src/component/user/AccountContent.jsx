import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiOutlineChevronLeft } from "react-icons/hi";
import axios from "axios";

import Button from "../Button";
import marketPic from "../../assets/marketPic.png";
import Modal from "../Modal";
import { remove } from "../../store/reducer/authSlice";
import { clearLocation } from "../../store/reducer/locationSlice";
import { clearCart, clearSelectedCartItems } from "../../store/reducer/cartSlice";
import handleImageError from '../../helpers/handleImageError'


export default function AccountContent() {
  const [profileData, setProfileData] = useState({});
  const token = localStorage.getItem("token");
  const profile = useSelector((state) => state.auth.profile);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const routes = [
    { name: "My Profile", to: "/user/account/my-profile" },
    { name: "My Address", to: "/user/account/my-address" },
  ];

  const handleLogout = () => {
    dispatch(remove());
    dispatch(clearLocation());
    dispatch(clearCart());
    dispatch(clearSelectedCartItems());
    localStorage.removeItem("selectedCartItems");
    localStorage.removeItem("token");
    navigate("/");
  };

  const getProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        const data = response.data.data;
        if (data) {
          setProfileData(data);
        } else {
          setProfileData({});
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    if(token) {
      getProfile();
    }
  }, [token]);

  return (
    <div className="py-2 sm:py-4 px-2 flex flex-col w-full sm:max-w-3xl mx-auto gap-4 lg:justify-center font-inter">
      {token && profile.role === "3" ? (
        <div className="grid gap-4">
          <div className="text-2xl sm:text-3xl font-bold text-maingreen px-6 text-center">
            My Account
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid justify-center">
              <img
                src={`${process.env.REACT_APP_BASE_URL}${profileData.imgProfile}`}
                onError={handleImageError}
                alt={"helo"}
                className="w-52 h-52 rounded-full border-4 border-maingreen"
              />
              <div className="text-center font-bold p-2">
                {profileData.name}
              </div>
            </div>
            <div className="grid content-center gap-2">
              {routes.map(({ name, to }, idx) => (
                <Link to={to}>
                  <div
                    key={idx}
                    className="border-b border-lightgrey pb-2 font-bold px-4 flex justify-between"
                  >
                    {name}
                    <HiOutlineChevronLeft
                      size={22}
                      className="rotate-180 text-maingreen"
                    />
                  </div>
                </Link>
              ))}
              <div className="sm:hidden">
                <Modal
                  onClickButton={handleLogout}
                  modalTitle={"Log Out"}
                  toggleName={"Log Out"}
                  content={"Are you sure you want to log out?"}
                  buttonCondition={"logoutOnAccount"}
                  buttonLabelOne={"Cancel"}
                  buttonLabelTwo={"Yes"}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-14 lg:mt-0">
          <div className="mx-auto">
            <img
              src={marketPic}
              alt="illustration"
              className="w-96 h-56 lg:w-[500px] lg:h-[300px] object-cover mx-auto"
            />
          </div>
          <div className="text-center font-bold w-5/6 mx-auto my-4 sm:w-96 lg:w-[500px] lg:text-2xl">
            Bringing Freshness to Your Doorstep: Your Trusted Online Grocery
            Store for the Finest Produce in Indonesia!
          </div>
          <div className="grid grid-rows-2 lg:grid-cols-2 gap-4">
            <Link to={"/register"}>
              <Button condition={"negative"} label={"Register"} />
            </Link>
            <Link to={"/login"}>
              <Button condition={"positive"} label={"Login"} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
