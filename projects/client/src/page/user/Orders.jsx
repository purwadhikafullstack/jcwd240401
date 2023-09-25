import React from "react";
import UserOrderContent from "../../component/user/UserOrderContent";
import NavbarTop from "../../component/NavbarTop";
import NavbarBottom from "../../component/NavbarBottom";

export default function Orders() {
  return (
    <div>
      <NavbarTop />
      <div>
        <UserOrderContent />
      </div>
      <NavbarBottom />
    </div>
  );
}
