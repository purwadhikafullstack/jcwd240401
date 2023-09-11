import React, { useState } from "react";

export default function SearchInputBar({ id, value, onSubmit, placeholder }) {
    const [searchValue, setSearchValue] = useState(value);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(searchValue);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <input
                value={searchValue}
                id={id}
                type="text"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={placeholder}
                className="h-10 border-none w-full bg-lightgrey rounded-md p-2 pl-4 pr-10 focus:outline-none shadow-md focus:ring-0"
            />
            <button
                type="submit"
                className="absolute right-3 top-2.5 h-5 w-5 text-maingreen font-bold"
            >
                <svg
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
            </button>
        </form>
    );
}
