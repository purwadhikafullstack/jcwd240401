import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { keepLocation } from '../../store/reducer/locationSlice'
import LayoutUser from '../../component/user/LayoutUser'
import HomeContent from '../../component/user/HomeContent'

export default function Home() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [error, setError] = useState("")
    const [cityAddress, setCityAddress] = useState("")
    const [provinceAddress, setProvinceAddress] = useState("")
    const dispatch = useDispatch()
    const profile = useSelector((state) => state.auth.profile)
    const token = localStorage.getItem("token")

    const coordinateToPlacename = async () => {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/location?latitude=${latitude}&longitude=${longitude}`)
        if (response.data) {
            if (response.data.data?.city === "Daerah Khusus Ibukota Jakarta") {
                setCityAddress(response.data.data?.city_district)
                setProvinceAddress("DKI Jakarta")
            } else {
                setCityAddress(response.data.data?.city)
                setProvinceAddress(response.data.data?.state)
            }
        }
    }

    const askForLocationPermission = async () => {
        const permissionGranted = await new Promise((resolve) => {
            const consent = window.confirm(
                "Do you allow this app to access your location? If not, your location will be our default branch location"
            );
            resolve(consent)
        })
        if (permissionGranted) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve(position),
                        (error) => reject(error)
                    );
                });

                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setError(null);
            } catch (error) {
                console.error("Error getting geolocation:", error.message);
                setError("Error getting geolocation. Please allow location access.");
            }
        } else {
            setLatitude("")
            setLongitude("")
            setError("Location access denied.");
        }
    }
    useEffect(() => {
        if (!token || !profile || profile.role !== "3") {
            if ("geolocation" in navigator) {
                askForLocationPermission();
            } else {
                setError("Geolocation is not supported by your browser.")
            }
        }
    }, [token, profile]);

    const getAddress = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/main-address`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (response.data) {
                setLatitude(response.data.data?.latitude)
                setLongitude(response.data.data?.longitude)
                setCityAddress(response.data.data?.City?.city_name)
                setProvinceAddress(response.data.data?.City?.Province?.province_name)
            }
        } catch (error) {
            console.error(error)
            if (error.response) {
                console.error(error.response.message)
            }
        }
    }

    useEffect(() => {
        if(!token || profile.role !== "3"){
            coordinateToPlacename()
        } else {
            getAddress()
        }
        dispatch(keepLocation({city: cityAddress, province: provinceAddress, latitude: latitude, longitude: longitude}))
    }, [token, latitude, longitude, cityAddress, provinceAddress])

    return (
        <LayoutUser>
            <HomeContent cityAddress={cityAddress} provinceAddress={provinceAddress} latitude={latitude} longitude={longitude}/>
        </LayoutUser>
    )
}
