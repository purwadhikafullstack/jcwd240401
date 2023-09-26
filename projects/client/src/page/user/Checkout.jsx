import React from "react";
import NavbarTop from "../../component/NavbarTop";
import NavbarBottom from "../../component/NavbarBottom";
import UserCheckoutContent from "../../component/user/UserCheckoutContent";

export default function Checkout() {

  return (
    <div>
      <NavbarTop />
      <div>
        <UserCheckoutContent />
      </div>
      <NavbarBottom />
    </div>
  );
}
