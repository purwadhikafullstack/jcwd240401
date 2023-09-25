import React from "react";

export default function SearchBar({ id, value, type, onChange, placeholder }) {
  return (
    <div className="relative w-full">
      <input
        value={value}
        id={id}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 border-none w-full bg-lightgrey rounded-md p-2 pl-10 pr-10 focus:outline-none shadow-md"
      />
      <svg
        className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 18a8 8 0 100-16 8 8 0 000 16z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-5.2-5.2"
        />
      </svg>
    </div>
  );
}
