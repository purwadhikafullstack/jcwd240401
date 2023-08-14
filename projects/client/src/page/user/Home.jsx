import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function Home() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [error, setError] = useState("")
    const [nearestBranch, setNearestBranch] = useState([])

    useEffect(() => {
        const askForLocationPermission = async () => {
        const permissionGranted = await new Promise((resolve) => {
        const consent = window.confirm(
            "Do yo allow this app to access your location?"
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

    console.log(latitude, longitude)

    useEffect(() => {
        try{
            axios.get(`http://localhost:8000/api/auth/nearest-branch?latitude=${latitude}&longitude=${longitude}`).then((response) => setNearestBranch(response.data))
        }catch(error){
            console.log(error)
        }
    }, [latitude, longitude])

    console.log(nearestBranch)

    return (
        <>
        <div>Home</div>
        </>
    )
}
