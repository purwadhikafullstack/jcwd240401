import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { HiPlus } from "react-icons/hi"
import { LuEdit } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { HiOutlineBuildingOffice2, HiOutlineHome } from "react-icons/hi2"

import Modal from '../Modal';
import Label from "../Label";
import Button from "../Button";
import { keepLocation } from "../../store/reducer/locationSlice";
import AlertHelper from '../AlertHelper';
import { clearCart } from "../../store/reducer/cartSlice";
import { getAddressByToken, removeOrSetMainAddress } from "../../api/profile";

export default function UserAddressContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allAddress, setAllAddress] = useState([])
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const token = localStorage.getItem("token")
    const getAddress = async () => {
        try {
            const response = await getAddressByToken(token)
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
            const response = await removeOrSetMainAddress(token, action, id)
            if (action === "main") {
                await axios.delete(
                    `${process.env.REACT_APP_API_BASE_URL}/users/empty-cart`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                dispatch(clearCart());
            }
            if (response.status === 200) {
                setSuccessMessage(response?.data?.message)
            }
            if (response.data.data) {
                dispatch(keepLocation({ city: response.data.data?.City?.city_name, province: response.data.data?.City?.Province?.province_name, latitude: response.data.data?.latitude, longitude: response.data.data?.longitude }))
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
        } finally {
            getAddress();
        }
    }

    useEffect(() => {
        getAddress()
    }, [token])

    return (
        <div className='sm:py-4 px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto'>
            <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate("/user/account")} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6'>My Address</div>
            </div>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            {allAddress.length !== 0 ? (
                allAddress.map((data) => (
                    <div key={data.id} className="grid grid-cols-1 gap-2 mt-2">
                        <div className="flex border-b border-lightgrey px-2 py-4">
                            <div className="basis-5/6 lg:basis-3/4">
                                <div className="font-medium">{data.receiver} <span className="">| {data.contact}</span></div>
                                <div className="text-sm text-darkgrey flex content-center items-center gap-1">{data.addressLabel === "Home" ? <HiOutlineHome size={15} className="text-maingreen" /> : <HiOutlineBuildingOffice2 size={15} className="text-maingreen" />} {data.streetName}</div>
                                <div className="text-darkgrey text-sm">{data?.City?.city_name}</div>
                                <div className="text-darkgrey text-sm">{data?.City?.Province?.province_name}</div>
                                {data.isMain ? (<div className="w-fit"><Label text="Main Address" labelColor="green" /></div>) : (<div><Modal toggleName="Set As Main" modalTitle="Set to Main Address" buttonCondition="setMain" content="This address will be set as main and product(s) in your cart will be reset. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleAction(data.id, "main")} /></div>)}
                            </div>
                            <div className="basis-1/6 lg:basis-1/4 grid grid-cols-2 content-center">
                                <div className={` ${data.isMain ? 'col-start-2' : 'col-start-1'} grid justify-center content-center`}>
                                    <Link to={`/user/account/my-address/modify/${encodeURIComponent(data.streetName)}`}><LuEdit className="text-maingreen text-base sm:text-xl mx-auto" /></Link>
                                </div>
                                <div className={`${data.isMain ? "opacity-0" : ""} text-reddanger grid justify-center content-center`}>
                                    {!data.isMain && <div className=""><Modal modalTitle="Delete Address" buttonCondition="trash" content="Deleting this address will permanently remove its access for future use. Are you sure?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={() => handleAction(data.id, "remove")} /> </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (<div className="text-center mx-auto"> No Address Found</div>)}
            {allAddress.length === 5 ? (
                <div className="grid justify-center py-2 mt-2 text-sm text-center md:text-base font-medium">
                    You have reached the maximum address limit (5). Please delete to create new address.
                </div>
            )
                : (
                    <Link to="/user/account/my-address/create"> <div className="grid justify-center py-2 mt-2">
                        <div className="flex gap-2 text-sm items-center"><div className="bg-maingreen rounded-lg w-6 h-6 grid justify-center content-center"><HiPlus size={16} className="text-white" /></div>Add new address</div>
                    </div></Link>
                )}
        </div>
    )
}