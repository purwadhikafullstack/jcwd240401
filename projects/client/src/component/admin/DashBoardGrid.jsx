import React from "react";

export default function DashBoardGrid() {
  return (
    <div className="bg-white rounded-md p-4 flex-1 border border-gray-200 flex items-center">
      <div className="rounded-full h-12 w-12 flex items-center justify-center">
        Logo
      </div>
      <div className="pl-2">
        <span className="text-sm text-gray-500 font-light">total sales</span>
        <div className="flex items-center">
          <div className="text-base text-gray-700 font-semibold">
            Rp. 25.000.000
          </div>
        </div>
      </div>
    </div>
  );
}
