import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { HiOutlineLocationMarker } from "react-icons/hi";
import adminHomePic from '../../assets/marketPic.png'
import { getBranchInfo } from '../../api/branch';

export default function AdminHomeContent() {
    const [branchData, setBranchData] = useState([])
    const profile = useSelector((state) => state.auth.profile)
    const token = localStorage.getItem("token")

    const branchLocation = async () => {
        try {
            const response = await getBranchInfo(token)
            if (response.data) {
                if (response.data?.data) {
                    setBranchData(response.data?.data)
                } else {
                    setBranchData([])
                }
            }
        } catch (error) {
            if (error.response) {
                console.log(error.response.message)
            }
        }
    }

    useEffect(() => {
        if (profile.role === "2") {
            branchLocation()
        }
    }, [profile.role])
    
    return (
        <div className="w-full h-full flex justify-center">
            <div className='w-1/2 flex flex-col items-center'>
                <img src={adminHomePic} alt="illustration" className='w-96' />
                <div className="text-3xl font-inter font-bold text-center">Welcome, {profile.name}</div>
                {branchData.length !== 0 ? (
                    <div className='text-center mt-5 sm:mt-0'>
                        <div className='text-center flex justify-center gap-1'> <HiOutlineLocationMarker className='text-maingreen text-5xl sm:text-2xl md:text-2xl lg:text-lg' /> {`${branchData.streetName}, ${branchData.City?.city_name}, ${branchData.City?.Province?.province_name}, ${branchData.postalCode}`}</div>
                    </div>
                ) : null}
                {profile.role === "2" ? (
                    <div className='mt-5 w-full grid justify-center shadow-lg p-4 rounded-md bg-gray-100'>
                        <span className='text-maingreen font-medium grid justify-center'>Daily Reminder!</span>
                        <span className='text-center'>Please check for incoming orders on the "Manage Orders" menu.</span>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
