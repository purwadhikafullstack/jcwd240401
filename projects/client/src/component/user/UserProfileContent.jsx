import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import Button from "../Button"
import ModalImageProfile from '../ModalImageProfile'
import AlertPopUp from '../AlertPopUp'

export default function UserProfileContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [profileData, setProfileData] = useState({})
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const handleModifyImg = async (values, { setSubmitting, resetForm, setStatus, initialValues, setFieldValue }) => {
        setSubmitting(true)
        const { file } = values
        const formData = new FormData()
        if (file) {
            formData.append("file", file)
        }
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/users/profile/image-profile`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            })
            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
                setFieldValue("file", null)
            }
        } catch (error) {
            const response = error.response;
            if (response?.data?.message === "An error occurs") {
                const { msg } = response.data?.errors[0];
                if (msg) {
                    setStatus({ success: false, msg });
                    setErrorMessage(`${msg}`)
                }
            }
            if (response?.data?.error) {
                const errMsg = response.data.error;
                console.log(errMsg)
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response?.status === 404) {
                setErrorMessage("Category not found")
            }
            if (response?.status === 500) {
                setErrorMessage("Create category failed: Server error")
            }
            handleShowAlert()
            resetForm()
        } finally {
            setSubmitting(false)
            getProfile()
        }
    }

    const getProfile = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setProfileData(data);
                } else {
                    setProfileData({});
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const data = [
        { name: "Name", value: `${profileData.name}` },
        { name: "Email", value: `${profileData.email}` },
        { name: "Phone", value: `${profileData.phone}` },
        { name: "Birth Date", value: profileData.birthdate ? `${new Date(profileData?.birthdate).toLocaleDateString("id-ID")}` : "-" },
        { name: "Gender", value: profileData.gender ? `${profileData?.gender.charAt(0).toUpperCase() + profileData?.gender.slice(1)}` : "-" },
        { name: "Referral Code", value: `${profileData?.referralCode}` },
    ]

    const routes = [
        { name: "Edit My Profile", to: `/user/account/my-profile/modify` },
        { name: "Change My Password", to: `/user/account/my-profile/change-password` },
    ]

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    useEffect(() => {
        getProfile()
    }, [token])


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
        <div className='py-4 px-2 flex flex-col w-full sm:max-w-3xl mx-auto gap-4 justify-center font-inter'>
            <div className='grid gap-4'>
                <div className='flex'>
                    <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                    <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6'>My Profile</div>
                </div>
                {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='grid justify-center content-center'>
                        <div className='relative'>
                            <img src={`${process.env.REACT_APP_BASE_URL}${profileData.imgProfile}`} onError={handleImageError} alt={"helo"} className="w-52 h-52 rounded-full border-4 border-maingreen" />
                            <div className='absolute bottom-3 right-3'><ModalImageProfile onSubmit={handleModifyImg} /></div>
                        </div>
                    </div>
                    <div className='grid content-center gap-2'>
                        {data.map(({ name, value }, idx) => (
                            <div key={idx} className='flex flex-col border-b border-lightgrey pb-2'>
                                <div className='text-darkgrey'>{name}</div>
                                <div className='font-bold'>{value}</div>
                            </div>
                        ))}
                        <div className='flex gap-2 w-full justify-center mt-10 sm:mt-4'>
                            {routes.map(({ name, to }, idx) => (
                                <Link key={idx} to={to}>
                                    <Button condition={"positive"} label={name} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
