import React from "react";

export default function CustomDropdownProduct({ options, onChange, placeholder, id }) {
    const params = new URLSearchParams(window.location.search);
    return (
        <div className="relative inline-block w-full">
            <select
                id={id}
                onChange={onChange}
                className="w-full mt-1 bg-gray-100 rounded-md focus:ring-0 border-none"
                value={params.get(id) || ""}
            >
                <option value="" disabled hidden>
                    {placeholder}
                </option>
                {options.map((obj) => {
                    return <option value={obj.value}>{obj.label}</option>;
                })}
            </select>
        </div>
    );
}