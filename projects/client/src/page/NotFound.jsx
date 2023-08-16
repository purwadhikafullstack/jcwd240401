import React from 'react'
import { useNavigate } from 'react-router-dom'
import background from '../assets/BackgroundLeaves.jpg'
import notFound from '../assets/NotFound.png'
import Button from '../component/Button'

export default function NotFound() {
    const navigate = useNavigate()

    const goToHome = () => {
        navigate("/")
    }
  return (
    <>
    <div className="absolute w-full min-h-screen bg-cover bg-center flex flex-col justify-center items-center" style={{backgroundImage: `url(${background})`, backgroundSize: 'cover'}}>
        <div className="w-80"><img src={notFound} alt="Error 404 Not Found" /></div>
        <div className="text-xl text-maingreen font-inter font-bold">Sorry, the page you are looking for does not exist</div>
        <div className="w-72 mt-6">
            <Button label={"Go To Home"} condition={"positive"} onClick={goToHome} />
        </div>
    </div>
    </>
  )
}

