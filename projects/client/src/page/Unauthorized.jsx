import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import unauthorized from '../assets/Unauthorized.png'
import background from '../assets/BackgroundLeaves.jpg'
import Button from '../component/Button'

export default function Unauthorized() {
    const navigate = useNavigate()
    const profile = useSelector((state) => state.auth.profile)

    const goToHome = () => {
        if (profile.role === '1' || profile.role === '2') {
            navigate("/admin")
        } else {
            navigate("/")
        }
    }
    return (
        <>
            <div className="absolute w-full min-h-screen bg-cover bg-center flex flex-col justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
                <div className="w-80"><img src={unauthorized} alt="Error 401 Unauthorized" /></div>
                <div className="text-xl text-maingreen font-inter text-center font-bold">You are unauthorized to access this page</div>
                <div className="w-72 mt-6">
                    <Button label={"Go To Home"} condition={"positive"} onClick={goToHome} />
                </div>
            </div>
        </>
    )
}
