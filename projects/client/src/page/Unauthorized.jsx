import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import unauthorized from '../assets/Unauthorized.png'
import background from '../assets/BackgroundLeaves.jpg'
import Button from '../component/Button'

export default function Unauthorized() {
    const navigate = useNavigate()    
    const location = useLocation()

    const goToHome = () => {
        if (location.state && location.state?.from) {
            const fromPath = location.state?.from?.pathname;
            if (fromPath.startsWith('/admin')) {
                navigate('/admin', {replace: true});
            } else if(fromPath.startsWith('/user')) {
                navigate('/', {replace: true})
            }
        }   
    }
  return (
    <>
    <div className="absolute w-full min-h-screen bg-cover bg-center flex flex-col justify-center items-center" style={{backgroundImage: `url(${background})`, backgroundSize: 'cover'}}>
        <div className="w-80"><img src={unauthorized} alt="Error 401 Unauthorized" /></div>
        <div className="text-xl text-maingreen font-inter font-bold">You are unauthorized to access this page</div>
        <div className="w-72 mt-6">
            <Button label={"Go To Home"} condition={"positive"} onClick={goToHome} />
        </div>
    </div>
    </>
  )
}
