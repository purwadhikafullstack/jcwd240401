import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { BiSolidEditAlt } from "react-icons/bi";
import { HiPlus } from "react-icons/hi"

import Modal from '../Modal';
import Label from "../Label";
import AlertPopUp from "../AlertPopUp";
import Button from "../Button";

export default function UserAddressContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allAddress, setAllAddress] = useState([])
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const token = localStorage.getItem("token")
    const getAddress = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/addresses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setAllAddress(data);
                } else {
                    setAllAddress([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }
    const handleAction = async (id, action) => {
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/users/addresses/${id}/${action}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.status === 200) {
                setSuccessMessage(response?.data?.message)
                handleShowAlert()
            }
        } catch (error) {
            if (error?.response?.status === 404) {
                setErrorMessage(error?.response?.data?.message)
            }
            if (error?.response?.status === 400) {
                setErrorMessage(error?.response?.data?.message)
                console.log(error?.response?.data?.message);
            }
            if (error?.response?.status === 401) {
                setErrorMessage(error?.response?.data?.message)
                console.log(error?.response?.data?.message);
            }
            handleShowAlert()
        } finally {
            getAddress();
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

    useEffect(() => {
        getAddress()
    }, [token])
    return (
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto'>
            <div className='flex'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={goBack} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6'>My Address</div>
            </div>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            {allAddress.length !== 0 ? (
                allAddress.map((data) => (
                    <div key={data.id} className="grid grid-cols-1 gap-2 mt-2">
                        <div className="flex border-b border-lightgrey px-2 py-4">
                            <div className="basis-3/4">
                                <div className="">{data.streetName}</div>
                                <div className="text-darkgrey text-sm">{data?.City?.city_name}</div>
                                <div className="text-darkgrey text-sm">{data?.City?.Province?.province_name}</div>
                                {data.isMain ? (<div><Label text="Main Address" labelColor="green" /></div>) : (<div><Modal toggleName="Set As Main" modalTitle="Set to Main Address" buttonCondition="setMain" content="This address will be set as main. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleAction(data.id, "main")} /></div>)}
                            </div>
                            <div className="basis-1/4 grid grid-cols-2 content-center">
                                <div className={` ${data.isMain ? 'col-start-2' : 'col-start-1'} grid justify-center`}>
                                    <Link to={`/user/account/my-address/modify/${encodeURIComponent(data.streetName)}`}>  <BiSolidEditAlt size={20} className="text-maingreen" /> </Link>
                                </div>
                                <div className={`${data.isMain ? "opacity-0" : ""}px-4 text-reddanger grid justify-center`}>
                                    {!data.isMain && <Modal modalTitle="Delete Address" buttonCondition="trash" content="Deleting this address will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleAction(data.id, "remove")} />}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (<div className="text-center mx-auto"> No Address Found</div>)}
            <Link to="/user/account/my-address/create"> <div className="grid justify-center py-2 mt-2">
                <div className="flex gap-2 text-sm items-center"><div className="bg-maingreen rounded-lg w-6 h-6 grid justify-center content-center"><HiPlus size={16} className="text-white" /></div>Add new address</div>
            </div></Link>
        </div>
    )
}
