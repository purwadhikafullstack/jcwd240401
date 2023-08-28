import React from 'react'

export default function InputField({
    id,
    value,
    type,
    onChange,
    onBlur,
    placeholder
}) {
    return (
        <>
            <input value={value} id={id} type={type} onChange={onChange} placeholder={placeholder} className="h-10 font-inter border-none w-full bg-lightgrey rounded-md py-2 focus:outline-none px-4" />
        </>
    )
}
