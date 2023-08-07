import React from 'react'

export default function InputField({
    id,
    value,
    type,
    onChange
}) {
    return (
        <>
            <input value={value} id={id} type={type} onChange={onChange} className="h-10 border-none w-72 bg-gray-100 rounded-md p-2 focus:outline-none" />
        </>
    )
}
