import React from 'react'

export default function Label({ text, labelColor }) {
    let style;

    switch (labelColor) {
        case "green":
            style =
                "bg-[#AEECB0] px-3 rounded-md text-maingreen text-xs w-fit mb-1 mt-2 mx-auto";
            break;
        case "blue":
            style =
                "bg-[#C6E6F3] px-3 rounded-md text-[#21357C] text-xs w-fit mb-1 mt-2 mx-auto";
            break;
        case "yellow":
            style =
                "bg-[#FCF1CD] px-3 rounded-md text-[#D7A604] text-xs w-fit mb-1 mt-2 mx-auto";
            break;
        case "red":
            style =
                "bg-[#F0BEBB] px-3 rounded-md text-[#C62E25] text-xs w-fit mb-1 mt-2 mx-auto";
            break;
        case "purple":
            style =
                "bg-[#EFDBFB] px-3 rounded-md text-[#854D9F] text-xs w-fit mb-1 mt-2 mx-auto";
            break;
        case "gray":
            style =
                "bg-[#EDEDED] px-3 rounded-md text-[#757575] text-xs w-fit mb-1 mt-2 mx-auto";
            break;
        default:
            style = "";
            break;
    }
    return (
        <div>
            <div className={style}>{text}</div>
        </div>
    )
}
