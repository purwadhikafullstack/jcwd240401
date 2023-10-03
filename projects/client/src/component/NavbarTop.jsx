import React from "react";
import { useSelector } from "react-redux";
import logo from "../assets/logo_Groceer-e.svg";
import { HiOutlineLocationMarker, HiOutlineShoppingCart } from "react-icons/hi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "./Button";
import background from "../assets/BackgroundLeaves.jpg";
import DropdownForNavbar from "./user/DropdownForNavbar";

export default function NavbarTop({ city, province }) {
  const token = localStorage.getItem("token")
  const profile = useSelector((state) => state.auth.profile)
  const address = useSelector((state) => state.location.location)
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = useSelector((state) => state.cart.cart);

  const defaultRoutes = [
    { menu: "Home", to: "/" },
    { menu: "Orders", to: "/user/orders" },
    { menu: "Cart", to: "/user/cart" },
    { menu: "Account", to: "/user/account" }
  ]
  const loggedInRoutes = [
    { menu: "Home", to: "/" },
    { menu: "Orders", to: "/user/orders" },
    { menu: <HiOutlineShoppingCart size={25} />, to: "/user/cart" },
    { menu: <DropdownForNavbar /> }
  ]

  const routes = token && profile.role === "3" ? loggedInRoutes : defaultRoutes

  const onClickLogIn = () => {
    navigate("/login");
  };
  return (
    <>
      <div
        className="hidden lg:w-full lg:h-24 lg:shadow-md lg:bg-cover lg:bg-center lg:grid lg:grid-cols-2 lg:px-10"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
        }}
      >
        <div className="w-full h-full col-span-1 grid grid-cols-2 items-center">
          <div><Link to="/"><img src={logo} alt="logo" /></Link></div>
          <div className='flex gap-4 items-center'>
            <HiOutlineLocationMarker className="w-6 h-6" />
            <div>{address.city && address.province ? `${address.city}, ${address.province}` : ""}</div>
          </div>
        </div>
        <div className="w-full h-full col-span-1 flex justify-end gap-20 items-center font-inter">
          <div className="flex items-center justify-between gap-10">
            {routes.map(({ menu, to }, idx) => (
              <Link
                to={to}
                className={`px-4 h-10 flex items-center justify-center ${location.pathname === to
                  ? `text-maingreen font-bold border-b-2 border-maingreen`
                  : `text-darkgrey`
                  }`}
                key={idx}
              >
                <div>{menu}</div>
              </Link>
            ))}
            {token && cartItems.length > 0 && (
              <span
                className="absolute top-7 right-[144px] text-white w-5 h-5 grid justify-center text-xs px-1 rounded-full bg-reddanger"

              >
                {cartItems.length}
              </span>
            )}
          </div>
          {token && profile.role === "3" ? null : (
            <div className="w-24">
              <Button
                condition={"positive"}
                label={"Log In"}
                onClick={onClickLogIn}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
