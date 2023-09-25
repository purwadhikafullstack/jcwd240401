import React from "react";

export default function CustomDropdownURLSearch({ options, onChange, placeholder, id }) {
    const params = new URLSearchParams(window.location.search);
    return (
        <div className="relative inline-block w-full">
            <select
                id={id}
                onChange={onChange}
                className="w-full bg-lightgrey rounded-md focus:ring-0 border-none shadow-md"
                value={params.get(id) || ""}
            >
                <option value="" disabled hidden>
                    {placeholder}
                </option>
                {options.map((obj) => {
                    return <option key={obj.value} value={obj.value}>{obj.label}</option>;
                })}
            </select>
        </div>
    );
}