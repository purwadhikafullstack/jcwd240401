import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Carousel from 'flowbite-react'
import NavbarTop from '../../component/NavbarTop'
import NavbarBottom from '../../component/NavbarBottom'
import Footer from '../../component/Footer'
import SearchBar from '../../component/SearchBar'
import Dropdown from '../../component/Dropdown'
import { remove } from '../../store/reducer/authSlice'
import productImg from '../../assets/BackgroundLeaves.jpg'
import Button from '../../component/Button'
import ProductCard from '../../component/ProductCard'

export default function Home() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [error, setError] = useState("")
    const [nearestBranch, setNearestBranch] = useState([])
    const [categories, setCategories] = useState([])

    const token = localStorage.getItem("token")
    const profile = useSelector((state) => state.auth.profile)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (token && profile.role === "3"){
            return
        }

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
    }, [token, profile]);

    useEffect(() => {
        if (token && profile.role === "3"){
            return
        }
        try{
            axios.get(`http://localhost:8000/api/auth/nearest-branch?latitude=${latitude}&longitude=${longitude}`).then((response) => setNearestBranch(response.data))
        }catch(error){
            console.log(error)
        }
    }, [latitude, longitude, token, profile])

    const city = nearestBranch.branchData?.City?.city_name
    const province = nearestBranch.branchData?.City?.Province?.province_name

    useEffect(() => {
        try{
            axios.get(`http://localhost:8000/api/admins/no-pagination-categories`).then((response) => setCategories(response.data))
        }catch(error){
            console.log(error)
        }
    }, [])

    const optionsName = ["Sort By Name"]
    const optionsPrice = ["Sort By Price"]

    const handleLogout = () => {
        dispatch(remove())
        localStorage.removeItem("token")
        navigate("/")
    }

    return (
        <>
        <NavbarTop city={city} province={province}/>
        <div className="w-full flex flex-col items-center">
            <div className="w-6/12 my-10">
                <SearchBar placeholder={"Search Product"}/>
            </div>
            <div className="w-6/12 h-64 mb-10 bg-greensuccess">Carousel</div>
            <div className="w-6/12 h-auto flex gap-4 overflow-x-auto mb-10">
                {categories.data?.map((category) => (
                    <div key={category.id} className='relative inline-block p-2 rounded-md' style={{backgroundImage: `url(http://localhost:8000${category.imgCategory})`, backgroundSize:'cover'}}>
                        <div className="absolute inset-0 bg-black bg-opacity-40 w-full h-full rounded-md"></div>
                        <button className='w-auto font-inter text-white whitespace-nowrap relative z-10'>{category.name}</button>
                    </div>
                ))}
            </div>
            <div className='w-6/12 flex gap-5 mb-10'>
                <Dropdown options={optionsName} placeholder={"Sort By Name"}/>
                <Dropdown options={optionsPrice} placeholder={"Sort By Price"}/>
            </div>
            <div className='w-6/12 flex mb-20'>
                <ProductCard />
            </div>
            {token ? <button onClick={handleLogout}>Log Out</button> : null}
        </div>
        <NavbarBottom />
        <Footer />
        </>
    )
}
