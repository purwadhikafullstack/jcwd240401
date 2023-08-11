import React, { useState } from "react";

export default function Dropdown({ options }) {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full">
      <div>
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          className="w-full text-darkgrey bg-lightgrey focus:ring-1 focus:outline-none focus:ring-[#2E6930] rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={toggleDropdown}
        >
          {selectedOption}
          <svg
            className={`${isOpen ? "" : "-rotate-90"
              } w-2.5 h-2.5 ml-2.5`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
      </div>
      {isOpen && (
        <ul className="absolute w-full mt-1 bg-gray-100 rounded-md border border-gray-300 z-50">
          {options.map((option, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-[#F0F0F0] cursor-pointer"
              onClick={() => handleOptionClick(option)}
              value={selectedOption}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
