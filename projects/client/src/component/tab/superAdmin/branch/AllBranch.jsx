import React, { useEffect, useState } from 'react'
import axios from 'axios'


export default function AllBranch() {
    const [branchData, setBranchData] = useState([])

    useEffect(() => {
        try{
            axios.get("http://localhost:8000/api/auth/admins/all-branch").then((response) => setBranchData(response.data))
        }catch(error){
            console.log(error)
        }
    }, [])

    return (
        <div className="hidden lg:w-full lg:h-full lg:flex lg:flex-col lg:items-center lg:justify-start mb-40">
        <div className="w-full h-10 bg-white border-maingreen border-b-2 grid grid-cols-9 gap-3 font-bold">
            <div className="col-span-1 flex justify-center font-inter items-center text-maingreen">No</div>
            <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">City</div>
            <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">Province</div>
            <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">Branch Admin</div>
            <div className="col-span-2 flex justify-center font-inter items-center text-maingreen">Contact</div>
        </div>
        {branchData.data?.map((data, index) => (
        <div className="w-full h-full border-lightgrey border-b-1 grid grid-cols-9 gap-3 ">
            <div className="col-span-1 flex justify-center text-center font-inter items-center">{index + 1}</div>
            <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.City?.city_name}</div>
            <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.City?.Province?.province_name}</div>
            <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.User?.name}</div>
            <div className="col-span-2 flex justify-center text-center font-inter items-center">{data.User?.phone}</div>
        </div>
        ))}
    </div>
    )
}
