import React, { useState } from "react";

export default function Dropdown({ options, onChange, placeholder }) {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = (event) => {
    event.preventDefault()
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option, event) => {
    setSelectedOption(option);
    onChange(option)
    setIsOpen(false)
    event.stopPropagation()
  };

  return (
    <div className="relative inline-block w-full">
      <div>
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          className={`${selectedOption ? 'text-black' : 'text-darkgrey'} w-full font-inter bg-lightgrey focus:ring-1 focus:outline-none focus:ring-[#2E6930] rounded-lg px-5 py-2.5 text-center inline-flex items-center justify-between`}
          onClick={(event) => toggleDropdown(event)}
        >
          {selectedOption ? selectedOption : placeholder}
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
        <ul className="absolute w-full mt-1 max-h-40 overflow-y-auto bg-gray-100 rounded-md border border-gray-300 z-50">
          {options.map((option, index) => (
            <li
              key={index}
              className="px-4 py-2 font-inter hover:bg-maingreen hover:text-white cursor-pointer"
              onClick={(event) => handleOptionClick(option, event)}
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
