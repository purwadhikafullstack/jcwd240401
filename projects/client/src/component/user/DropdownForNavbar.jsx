import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { HiOutlineUser } from "react-icons/hi";
import { remove } from "../../store/reducer/authSlice";
import Modal from "../Modal";
import { clearLocation } from "../../store/reducer/locationSlice";
import { clearCart, clearSelectedCartItems } from "../../store/reducer/cartSlice";
import handleImageError from "../../helpers/handleImageError";

export default function DropdownForNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation()
  const profile = useSelector((state) => state.auth.profile);

  const toggleDropdown = (event) => {
    event.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(remove());
    dispatch(clearLocation());
    dispatch(clearCart());
    dispatch(clearSelectedCartItems());
    localStorage.removeItem("selectedCartItems");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="relative inline-block w-full">
      <div className={`h-10 flex items-center ${location.pathname.startsWith("/user/account") ? `text-maingreen font-bold border-b-2 border-maingreen` : `text-darkgrey`}`}>
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          className="h-8 w-8 rounded-full flex justify-center items-center bg-lightgrey"
          onClick={(event) => toggleDropdown(event)}
        >
          {profile.imgProfile ? (
            <img
              src={`${process.env.REACT_APP_BASE_URL}${profile.imgProfile}`}
              alt="Profile Picture"
              className="rounded-full h-full w-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <HiOutlineUser className="h-6 w-6 rounded-full text-darkgrey bg-lightgrey" />
          )}
        </button>
      </div>
      {isOpen && (
        <div className="flex justify-end">
          <ul className="absolute w-60 mt-1 max-h-40 overflow-y-auto bg-gray-100 rounded-md border border-gray-300 z-50">
            <Link to="/user/account">
              <li
                className={`p-2 font-inter hover:bg-maingreen hover:text-white cursor-pointer ${location.pathname.startsWith("/user/account") ? `text-maingreen font-bold` : `text-darkgrey`}`}
              >
                My Account
              </li>
            </Link>
            <li>
              <Modal
                onClickButton={handleLogout}
                modalTitle={"Log Out"}
                toggleName={"Log Out"}
                content={"Are you sure you want to log out?"}
                buttonCondition={"logout"}
                buttonLabelOne={"Cancel"}
                buttonLabelTwo={"Yes"}
              />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
