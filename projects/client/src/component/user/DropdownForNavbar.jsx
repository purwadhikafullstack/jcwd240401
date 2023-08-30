import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { remove } from "../../store/reducer/authSlice";
import Modal from "../Modal";

export default function DropdownForNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const profile = useSelector((state) => state.auth.profile)

  const toggleDropdown = (event) => {
    event.preventDefault()
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(remove())
    localStorage.removeItem("token")
    navigate("/")
}
  

  return (
    <div className="relative inline-block w-full">
      <div>
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          className="h-10 w-10 rounded-full bg-darkgrey"
          onClick={(event) => toggleDropdown(event)}
        >
         {profile.imgProfile ? <img src={profile.imgProfile} alt="Profile Picture" /> : null}   
        </button>
      </div>
      {isOpen && (
        <div className="flex justify-end">
        <ul className="absolute w-60 mt-1 max-h-40 overflow-y-auto bg-gray-100 rounded-md border border-gray-300 z-50">
          <Link to="/user/account">
            <li
              className="p-2 font-inter hover:bg-maingreen hover:text-white cursor-pointer"
              //   onClick={(event) => handleMyAccount( event)}
              >
              My Account
            </li>
          </Link>
            <li>
                <Modal onClickButton={handleLogout} modalTitle={"Log Out"} toggleName={"Log Out"} content={"Are you sure you want to log out?"} buttonCondition={"logout"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} />
            </li>
        </ul>
        </div>
      )}
    </div>
  );
}
