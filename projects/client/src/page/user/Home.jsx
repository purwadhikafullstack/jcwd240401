import React, {useEffect, useState} from 'react'
import axios from 'axios'
import NavbarTop from '../../component/NavbarTop'
import NavbarBottom from '../../component/NavbarBottom'

export default function Home() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [error, setError] = useState("")
    const [nearestBranch, setNearestBranch] = useState([])

    useEffect(() => {
        const askForLocationPermission = async () => {
        const permissionGranted = await new Promise((resolve) => {
        const consent = window.confirm(
            "Do you allow this app to access your location? If not, your location will be our default branch location"
        );
        resolve(consent);
        });

        if (permissionGranted) {
            navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setError(null);
            },
            (error) => {
                console.error("Error getting geolocation:", error.message);
                setError("Error getting geolocation. Please allow location access.");
            }
        );
        } else {
            setError("Location access denied.");
        }
    };

        if ("geolocation" in navigator) {
            askForLocationPermission();
        } else {
            setError("Geolocation is not supported by your browser.");
        }
    }, []);

    useEffect(() => {
        try{
            axios.get(`http://localhost:8000/api/auth/nearest-branch?latitude=${latitude}&longitude=${longitude}`).then((response) => setNearestBranch(response.data))
        }catch(error){
            console.log(error)
        }
    }, [latitude, longitude])

    const city = nearestBranch.branchData?.City?.city_name
    const province = nearestBranch.branchData?.City?.Province?.province_name

    return (
        <>
        <NavbarTop city={city} province={province}/>
        <div>Home</div>
        <NavbarBottom />
        </>
    )
}
