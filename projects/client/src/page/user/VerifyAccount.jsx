import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {useParams} from 'react-router-dom'
import unverified from '../../assets/Profile Interface.png'
import background from '../../assets/BackgroundLeaves.jpg'
import verified from '../../assets/Verified.png'
import Button from '../../component/Button'
import AlertPopUp from '../../component/AlertPopUp'


export default function NotFound() {
    const [image, setImage] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [isVerify, setIsVerify] = useState(false)
    const {verificationToken} = useParams()

    useEffect(() => {
        try{
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/users/profile?token=${verificationToken}`).then((response) => setIsVerify(response.data.data?.isVerify))
            if(isVerify){
                setDisabled(true)
                setImage(true)
            }
        }catch(error){
            console.log(error)
        }
    }, [isVerify, verificationToken])

    const verify = async() => {
        try{
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/auth/users/verify?token=${verificationToken}`)
            if(response.status === 200) {
                setImage(true)
                setErrorMessage("")
                setDisabled(true)
            }
        }catch(error){
            if(error.response.status === 500){
                setErrorMessage("Verification failed: Server error")
            }else if(error.response?.data?.message === "token invalid"){
                setErrorMessage("token invalid")
            }
            handleShowAlert()
        }
    }

    const handleShowAlert = () => {
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }

    const handleHideAlert = () => {
        setShowAlert(false)
    }
  return (
    <>
    <div className="absolute w-full min-h-screen bg-cover bg-center flex flex-col justify-center items-center" style={{backgroundImage: `url(${background})`, backgroundSize: 'cover'}}>
        <div className="w-80"><img src={image ? verified : unverified} alt="verification illustartion" /></div>
        <div className="text-xl text-maingreen text-center font-inter font-bold">{disabled ? "Your account has been verified" : "Click the button below to verify your Groceer-e account"}</div>
        <div>
        {showAlert ? (<AlertPopUp condition={"fail"} content={errorMessage} setter={handleHideAlert}/>) : (null)}
        </div>
        <div className="w-72 mt-6">
            <Button label={"Verify"} condition={"positive"} onClick={verify} isDisabled={disabled} />
        </div>
    </div>
    </>
  )
}

