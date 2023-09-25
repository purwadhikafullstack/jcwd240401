import React from "react";
import { Link } from "react-router-dom";

import marketPic from "../../assets/marketPic.png";
import Button from "../Button";

export default function UnauthenticatedContent() {
  return (
    <div className="mt-14 lg:mt-0">
      <div className="mx-auto">
        <img
          src={marketPic}
          alt="illustration"
          className="w-96 h-56 lg:w-[500px] lg:h-[300px] object-cover mx-auto"
        />
      </div>
      <div className="text-center font-bold w-5/6 mx-auto my-4 sm:w-96 lg:w-[500px] lg:text-2xl">
        Bringing Freshness to Your Doorstep: Your Trusted Online Grocery Store
        for the Finest Produce in Indonesia!
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
  );
}
