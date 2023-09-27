import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft } from "react-icons/hi";

import Button from "../Button";
import marketPic from "../../assets/marketPic.png";
import Modal from "../Modal";
import { remove } from "../../store/reducer/authSlice";
import { clearLocation } from "../../store/reducer/locationSlice";
import { clearCart, clearSelectedCartItems } from "../../store/reducer/cartSlice";
import handleImageError from '../../helpers/handleImageError'
import { getProfileByToken } from "../../api/profile";
import UnauthenticatedContent from "./UnauthenticatedContent";

export default function AccountContent() {
  const [profileData, setProfileData] = useState({});
  const token = localStorage.getItem("token");
  const profile = useSelector((state) => state.auth.profile);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      const response = await getProfileByToken(token)
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
    if (token) {
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
                className="w-52 h-52 rounded-full border-4 border-maingreen object-cover"
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
              <div className="lg:hidden">
                <Modal onClickButton={handleLogout} modalTitle={"Log Out"} toggleName={"Log Out"} content={"Are you sure you want to log out?"} buttonCondition={"logoutOnAccount"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <UnauthenticatedContent />
      )}
    </div>
  );
}
