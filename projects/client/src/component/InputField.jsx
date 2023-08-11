import React from 'react'

export default function InputField({
    id,
    value,
    type,
    onChange,
    onBlur
}) {
    return (
        <>
        <input value={value} id={id} type={type} onChange={onChange} onBlur={onBlur} className="h-10 border-none w-full bg-[#EDEDED] rounded-md p-2 focus:outline-none" />
        </>
    )
}
