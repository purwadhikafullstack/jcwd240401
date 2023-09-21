import React from "react";
import rupiah from "../../helpers/rupiah";

export default function DashBoardGrid({ data, title, logo }) {
  return (
    <div className="bg-white rounded-md p-4 flex-1 border border-gray-200 flex items-center">
      <div className="rounded-full h-12 w-12 flex items-center justify-center">
        {logo}
      </div>
      <div className="pl-2">
        <span className="text-sm text-gray-500 font-light">{title}</span>
        <div className="flex items-center">
          <div className="text-base text-gray-700 font-semibold">
            {title === "Total Sales" ? rupiah(data) : data}
          </div>
        </div>
      </div>
    </div>
  );
}
