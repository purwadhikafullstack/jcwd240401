import React from "react";

export default function DashBoardList() {
  return (
    <div className="bg-white px-4 pt-3 pb-4 rounded-md border border-gray-200 w-full">
      <span>Popular Products</span>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex">
          <div className="w-10 h-10 min-w-10 bg-gray-200 rounded-sm" />
          <div className="ml-4 flex flex-col">
            <span className="text-sm font-semibold text-gray-800">
              ini product nya
            </span>
            <span className="text-sm ">123 in stock</span>
          </div>
        </div>
        <div className="flex">
          <div className="w-10 h-10 min-w-10 bg-gray-200 rounded-sm" />
          <div className="ml-4 flex flex-col">
            <span className="text-sm font-semibold text-gray-800">
              ini product nya
            </span>
            <span className="text-sm ">123 in stock</span>
          </div>
        </div>
        <div className="flex">
          <div className="w-10 h-10 min-w-10 bg-gray-200 rounded-sm" />
          <div className="ml-4 flex flex-col">
            <span className="text-sm font-semibold text-gray-800">
              ini product nya
            </span>
            <span className="text-sm ">123 in stock</span>
          </div>
        </div>
        <div className="flex">
          <div className="w-10 h-10 min-w-10 bg-gray-200 rounded-sm" />
          <div className="ml-4 flex flex-col">
            <span className="text-sm font-semibold text-gray-800">
              ini product nya
            </span>
            <span className="text-sm ">123 in stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
