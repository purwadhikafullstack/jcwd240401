import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { HiOutlineLocationMarker } from "react-icons/hi";
import adminHomePic from '../../assets/marketPic.png'

export default function AdminHomeContent() {
    const [branchData, setBranchData] = useState([])
    const profile = useSelector((state) => state.auth.profile)
    const token = localStorage.getItem("token")

    const branchLocation = async() => {
        try{
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/branch-info`, {
                headers: { 'Authorization' : `Bearer ${token}`}
            })

            if(response.data){
                if(response.data?.data){
                    setBranchData(response.data?.data)
                } else {
                    setBranchData([])
                }
            }
        }catch(error){
            if(error.response){
                console.log(error.response.message)
            }
        }
    }

    useEffect(() => {
        if(profile.role === "2"){
            branchLocation()
        }
    }, [profile.role])
    return (
        <div className="w-full h-full flex justify-center">
            <div className='w-1/2 flex flex-col items-center'>
                <img src={adminHomePic} alt="illustration" className='w-96'/>
                <div className="text-3xl font-inter font-bold text-center">Welcome, {profile.name}</div>
                {branchData.length !== 0 ? (
                    <div className='text-center mt-5 sm:mt-0'>
                        <div className='text-center flex justify-center gap-1'> <HiOutlineLocationMarker className='text-maingreen text-5xl sm:text-2xl md:text-2xl lg:text-lg' /> {`${branchData.streetName}, ${branchData.City?.city_name}, ${branchData.City?.Province?.province_name}, ${branchData.postalCode}`}</div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
