import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import jwtDecode from 'jwt-decode'
import { useNavigate, useLocation } from 'react-router-dom'
import { keepLocation } from '../../store/reducer/locationSlice'
import { keep, remove } from '../../store/reducer/authSlice'
import LayoutUser from '../../component/user/LayoutUser'
import HomeContent from '../../component/user/HomeContent'
import { getMainAddress } from '../../api/profile'
import { convertCoordinateToPlacename } from '../../api/location'

export default function Home() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [error, setError] = useState("")
    const [cityAddress, setCityAddress] = useState("")
    const [provinceAddress, setProvinceAddress] = useState("")
    const dispatch = useDispatch()
    const profile = useSelector((state) => state.auth.profile)
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const location = useLocation()

    const coordinateToPlacename = async () => {
        const response = await convertCoordinateToPlacename(latitude, longitude)
        if (response.data) {
            if (response.data.data?.city === "Daerah Khusus Ibukota Jakarta") {
                setCityAddress(response.data.data?.city_district)
                setProvinceAddress("DKI Jakarta")
            } else {
                setCityAddress(response.data.data?.city || response.data?.data?.county)
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
                setLatitude("")
                setLongitude("")
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
        if (!token) {
            if ("geolocation" in navigator) {
                askForLocationPermission();
            } else {
                setError("Geolocation is not supported by your browser.")
            }
        }
    }, [token, profile]);

    const getAddress = async () => {
        try {
            const response = await getMainAddress(token)
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

    const keepLogin = async () => {
        let token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/auth/keep-login`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    if (response.data.userId) {
                        localStorage.setItem("token", response.data.refreshToken);
                        const decoded = jwtDecode(token);
                        dispatch(keep(decoded));
                    }
                }
            } catch (error) {
                if (error.response.status === 401) {
                    dispatch(remove())
                    localStorage.removeItem("token")
                    console.log(error)
                    navigate("/login", { state: { from: location } })
                } else {
                    console.log(error)
                }
            }
        }
    };

    useEffect(() => {
        if (!token) {
            coordinateToPlacename()
        } else {
            getAddress()
        }
        dispatch(keepLocation({ city: cityAddress, province: provinceAddress, latitude: latitude, longitude: longitude }))
    }, [token, latitude, longitude, cityAddress, provinceAddress])

    useEffect(() => {
        if (token) {
            keepLogin()
        }
    }, [token])

    return (
        <LayoutUser>
            <HomeContent cityAddress={cityAddress} provinceAddress={provinceAddress} latitude={latitude} longitude={longitude} />
        </LayoutUser>
    )
}
