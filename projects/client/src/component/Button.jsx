import React from "react";
import {
  HiTrash,
  HiOutlineCheckCircle,
  HiOutlinePlusCircle,
  HiOutlineMinusCircle,
  HiOutlineChevronLeft,
} from "react-icons/hi";
import { HiPlusCircle } from "react-icons/hi2";
import { BiSolidEditAlt } from "react-icons/bi";
import { LuCopy, LuCopyCheck } from "react-icons/lu"

export default function Button({
  label,
  onClick,
  isDisabled,
  condition,
  buttonType,
  size
}) {
  let mainButtonClass, hoverClass, icon, iconClass, disabledStyle;

  disabledStyle = isDisabled
    ? "px-4 mr-2 py-2 rounded-lg text-white text-base w-full bg-darkgrey"
    : "";

  switch (condition) {
    case "positive":
      mainButtonClass =
        "bg-[#2E6930] px-4 mr-2 h-10 rounded-lg text-white text-base w-full";
      hoverClass = "hover:font-bold hover:bg-[#1E4620]";
      break;
    case "negative":
      mainButtonClass =
        "bg-white px-4 mr-2 h-10 rounded-lg text-[#2E6930] border border-[#2E6930] text-base w-full";
      hoverClass = "hover:font-bold hover:bg-slate-100";
      break;
    case "plus":
      mainButtonClass = `grid text-${size} w-fit h-fit`;
      hoverClass = !isDisabled && "hover:bg-slate-100";
      icon = (
        <HiOutlinePlusCircle
          className={isDisabled ? "text-darkgrey" : "text-[#2E6930] "}
        />
      );
      iconClass = "grid justify-center";
      disabledStyle = `text-${size}`;
      break;
    case "minus":
      mainButtonClass = `grid text-${size} w-fit h-fit`;
      hoverClass = !isDisabled && "hover:bg-slate-100";
      icon = (
        <HiOutlineMinusCircle
          className={isDisabled ? "text-darkgrey" : "text-[#2E6930] "}
        />
      );
      iconClass = "grid justify-center";
      disabledStyle = `text-${size} text-darkgrey`;
      break;
    case "added":
      mainButtonClass = "grid text-2xl w-[24px] h-[24px]";
      hoverClass = !isDisabled && "hover:bg-slate-100";
      icon = <HiOutlineCheckCircle className="text-[#2E6930] bg-white rounded-full" />;
      iconClass = "grid justify-center";
      break;
    case "toAdd":
      mainButtonClass = "grid text-2xl w-[24px] h-[24px]";
      hoverClass = !isDisabled && "hover:bg-slate-100";
      icon = <HiPlusCircle className="text-[#2E6930] bg-white rounded-full" />;
      iconClass = "grid justify-center";
      break;
    case "trash":
      mainButtonClass = "grid text-xl sm:text-2xl justify-center content-center";
      hoverClass = !isDisabled && "hover:bg-slate-100";
      icon = <HiTrash className="text-reddanger" />;
      iconClass = "grid justify-center";
      break;
    case "logout":
      mainButtonClass =
        "px-2 py-2 w-52 border-b border-lightgrey text-reddanger text-left";
      break;
    case "logoutOnAccount":
      mainButtonClass = "px-4 py-2 w-full text-reddanger text-left font-bold";
      break;
    case "setMain":
      mainButtonClass =
        "px-2 w-fit border border-maingreen text-maingreen text-sm mt-2 mb-1";
      break;
    case "back":
      mainButtonClass = `grid text-xl sm:text-2xl w-fit h-[24px] px-2`;
      hoverClass = !isDisabled && "hover:bg-slate-100";
      icon = <HiOutlineChevronLeft size={22} className="rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.8" }} />;
      iconClass = "grid justify-center";
      break;
    case "editImgProfile":
      mainButtonClass =
        "grid text-xl sm:text-2xl w-fit h-fit p-2 content-center bg-maingreen rounded-full";
      hoverClass = !isDisabled && "hover:bg-slate-100";
      icon = <BiSolidEditAlt size={22} className="text-white" />;
      iconClass = "grid justify-center";
      break;
    case "copy":
      mainButtonClass = "grid text-lg sm:text-xl justify-center content-center p-1 rounded-md";
      hoverClass = !isDisabled && "hover:bg-gray-100";
      icon = <LuCopy className="text-maingreen font-medium" />;
      iconClass = "grid justify-center";
      break;
    case "copied":
      mainButtonClass = "grid text-lg sm:text-xl justify-center content-center p-1 rounded-md";
      hoverClass = !isDisabled && "cursor-default";
      icon = <LuCopyCheck className="text-maingreen font-medium" />;
      iconClass = "grid justify-center";
      break;
    default:
      mainButtonClass = "";
      hoverClass = "";
      break;
  }

  return (
    <button
      type={buttonType}
      disabled={isDisabled}
      onClick={onClick}
      className={`${!isDisabled && mainButtonClass} ${!isDisabled && hoverClass} ${isDisabled && disabledStyle}`}
    >
      {icon ? <div className={iconClass}>{icon}</div> : label}
    </button>
  );
}
