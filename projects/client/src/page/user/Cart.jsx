import React, { useEffect, useState } from "react";
import NavbarTop from "../../component/NavbarTop";
import NavbarBottom from "../../component/NavbarBottom";
import UserCartContent from "../../component/user/UserCartContent";

export default function Cart() {
  return (
    <div>
      <NavbarTop />
      <div>
        <UserCartContent />
      </div>
      <NavbarBottom />
    </div>
  );
}
