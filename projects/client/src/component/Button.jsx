import React from "react";
import { HiOutlinePlusSm, HiOutlineMinusSm } from "react-icons/hi";

export default function Button({
    label,
    onClick,
    isDisabled,
    condition,
}) {
    let mainButtonClass, hoverClass, icon, iconClass;

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
            mainButtonClass = "bg-white text-[#2E6930] border-2 p-0 m-0 border-[#2E6930] text-base rounded-full w-[24px] h-[24px]";
            hoverClass = !isDisabled && "hover:bg-slate-100";
            icon = <HiOutlinePlusSm className="text-[#2E6930]" />;
            iconClass = "grid justify-center";
            break;
        case "minus":
            mainButtonClass = "bg-white text-[#2E6930] border-2 p-0 m-0 border-[#2E6930] text-base rounded-full w-[24px] h-[24px]";
            hoverClass = !isDisabled && "hover:bg-slate-100";
            icon = <HiOutlineMinusSm className="text-[#2E6930]" />;
            iconClass = "grid justify-center";
            break;
        default:
            mainButtonClass = "";
            hoverClass = "";
            break;
    }

    return (
        <button
            type="button"
            disabled={isDisabled}
            onClick={onClick}
            className={`${mainButtonClass} ${!isDisabled && hoverClass}`}
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
