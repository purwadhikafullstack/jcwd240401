import React from "react";
import { HiTrash, HiOutlineCheckCircle, HiOutlinePlusCircle, HiOutlineMinusCircle } from "react-icons/hi";
import { HiPlusCircle } from "react-icons/hi2"

export default function Button({
    label,
    onClick,
    isDisabled,
    condition,
    buttonType
}) {
    let mainButtonClass, hoverClass, icon, iconClass, disabledStyle;

    disabledStyle = isDisabled ? 'px-4 mr-2 py-2 rounded-lg text-white text-base w-full bg-darkgrey' : '';

    switch (condition) {
        case "positive":
            mainButtonClass =
                "bg-[#2E6930] px-4 mr-2 py-2 rounded-lg text-white text-base w-full";
            hoverClass = "hover:font-bold hover:bg-[#1E4620]";
            break;
        case "negative":
            mainButtonClass =
                "bg-white px-4 mr-2 py-1 rounded-lg text-[#2E6930] border border-[#2E6930] text-base w-full";
            hoverClass = "hover:font-bold hover:bg-slate-100";
            break;
        case "plus":
            mainButtonClass = "grid text-2xl w-[24px] h-[24px]";
            hoverClass = !isDisabled && "hover:bg-slate-100";
            icon = <HiOutlinePlusCircle className="text-[#2E6930]" />;
            iconClass = "grid justify-center";
            break;
        case "minus":
            mainButtonClass = "grid text-2xl w-[24px] h-[24px]";
            hoverClass = !isDisabled && "hover:bg-slate-100";
            icon = <HiOutlineMinusCircle className="text-[#2E6930]" />;
            iconClass = "grid justify-center";
            break;
        case "added":
            mainButtonClass = "grid text-2xl w-[24px] h-[24px]";
            hoverClass = !isDisabled && "hover:bg-slate-100";
            icon = <HiOutlineCheckCircle className="text-[#2E6930]" />;
            iconClass = "grid justify-center";
            break;
        case "toAdd":
            mainButtonClass = "grid text-2xl w-[24px] h-[24px]";
            hoverClass = !isDisabled && "hover:bg-slate-100";
            icon = <HiPlusCircle className="text-[#2E6930]" />;
            iconClass = "grid justify-center";
            break;
        case "trash":
            mainButtonClass = "grid text-xl sm:text-2xl w-[24px] h-[24px]";
            hoverClass = !isDisabled && "hover:bg-slate-100";
            icon = <HiTrash className="text-reddanger" />;
            iconClass = "grid justify-center";
            break;
        case "logout":
            mainButtonClass = "px-2 py-2 w-full border-b border-lightgrey text-reddanger text-left";
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
            {icon ? (
                <div className={iconClass}>
                    {icon}
                </div>
            ) : (
                label
            )}
        </button>
    );
}
