import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Button from "../Button"
import ModalImageProfile from '../ModalImageProfile'
import handleImageError from '../../helpers/handleImageError'
import AlertHelper from '../AlertHelper';
import { getProfileByToken, modifyImageProfile } from '../../api/profile'

export default function UserProfileContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [profileData, setProfileData] = useState({})
    const [isCopy, setIsCopy] = useState(false)
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
            const response = await modifyImageProfile(token, formData)
            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
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
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response?.status === 404) {
                setErrorMessage("Profile image not found")
            }
            if (response?.status === 500) {
                setErrorMessage("Modify image failed: Server error")
            }
            resetForm()
        } finally {
            setSubmitting(false)
            getProfile()
        }
    }

    const getProfile = async () => {
        try {
            const response = await getProfileByToken(token)
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

    async function copy(text) {
        try {
            await navigator.clipboard.writeText(text)
            setIsCopy(true)
        } catch (error) {
            setIsCopy(false)
        }
        setTimeout(() => {
            setIsCopy(false)
        }, 2000);
    }

    const data = [
        { name: "Name", value: `${profileData.name}` },
        { name: "Email", value: `${profileData.email}` },
        { name: "Phone", value: `${profileData.phone}` },
        { name: "Birth Date", value: profileData.birthdate ? `${new Date(profileData?.birthdate).toLocaleDateString("id-ID")}` : "-" },
        { name: "Gender", value: profileData.gender ? `${profileData?.gender.charAt(0).toUpperCase() + profileData?.gender.slice(1)}` : "-" },
        { name: "Referral Code", value: `${profileData?.referralCode}`, extra: true },
    ]

    const routes = [
        { name: "Edit My Profile", to: `/user/account/my-profile/modify` },
        { name: "Change My Password", to: `/user/account/my-profile/change-password` },
    ]

    useEffect(() => {
        getProfile()
    }, [token])

    return (
        <div className='sm:py-4 px-2 flex flex-col w-full sm:max-w-3xl mx-auto gap-4 lg:justify-center font-inter'>
            <div className='grid gap-4'>
                <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                    <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                    <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6'>My Profile</div>
                </div>
                <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} />
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='grid justify-center content-center'>
                        <div className='relative'>
                            <img src={`${process.env.REACT_APP_BASE_URL}${profileData.imgProfile}`} onError={handleImageError} alt={"helo"} className="w-52 h-52 rounded-full border-4 border-maingreen object-cover" />
                            <div className='absolute bottom-3 right-3'><ModalImageProfile onSubmit={handleModifyImg} /></div>
                        </div>
                    </div>
                    <div className='grid content-center gap-2'>
                        {data.map(({ name, value, extra }, idx) => (
                            <div key={idx} className='flex flex-col border-b border-lightgrey pb-2'>
                                <div className='text-darkgrey'>{name}</div>
                                <div className='font-bold flex justify-between'>{value} {extra && (isCopy ? (<div className='w-fit flex font-normal gap-1'><span className='text-sm contents'>Copied</span><Button condition={"copied"} /> </div>) : <Button condition={"copy"} onClick={() => copy(value)} />)}</div>
                            </div>
                        ))}
                        <div className='flex flex-col 2xl:flex-row gap-2 w-full justify-center mt-10 sm:mt-4'>
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