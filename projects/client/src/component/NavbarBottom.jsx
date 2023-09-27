import React from "react";
import {
  HiOutlineHome,
  HiOutlineShoppingCart,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiHome,
  HiDocumentText,
  HiShoppingCart,
  HiUser,
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function BottomNavbar() {
  const cartItems = useSelector((state) => state.cart.cart);
  const location = useLocation();
  const routes = [
    { iconDefault: HiOutlineHome, iconActive: HiHome, name: "Home", to: "/" },
    {
      iconDefault: HiOutlineDocumentText,
      iconActive: HiDocumentText,
      name: "Orders",
      to: "/user/orders",
    },
    {
      iconDefault: HiOutlineShoppingCart,
      iconActive: HiShoppingCart,
      name: "Cart",
      to: "/user/cart",
      extra: true,
    },
    {
      iconDefault: HiOutlineUser,
      iconActive: HiUser,
      name: "Account",
      to: "/user/account",
      isActive: location.pathname.startsWith("/user/account"),
    },
  ];
  return (
    <>
      <div
        className="fixed bottom-0 left-0 w-full h-14 flex justify-center border-t z-50 bg-maingreen border-lightgrey lg:hidden"
        style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)" }}
      >
        <div className="h-full w-4/5 flex justify-between items-center">
          {routes.map(
            (
              {
                iconDefault: IconDefault,
                iconActive: IconActive,
                name,
                to,
                isActive,
                extra,
              },
              index
            ) => (
              <Link to={to} key={index}>
                <div
                  className={`flex flex-col h-full justify-center items-center ${
                    isActive || location.pathname === to
                      ? `text-white font-medium`
                      : `text-lightgrey`
                  }`}
                >
                  {extra && cartItems.length > 0 && (
                    <div className="relative">
                      <div className="text-white text-xs w-5 h-5 grid justify-center rounded-full bg-reddanger absolute top-0 left-0">
                        {cartItems.length}
                      </div>
                    </div>
                  )}
                  {isActive || location.pathname === to ? (
                    <IconActive className="h-6 w-6" />
                  ) : (
                    <IconDefault className="w-6 h-6" />
                  )}
                  <div>{name}</div>
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </>
  );
}
