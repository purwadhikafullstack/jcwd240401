import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
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
