import React, { useState } from 'react'
import { HiMenu, HiX } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../assets/logo_Groceer-e.svg'
import backgroundSideBar from '../assets/BackgroundLeaves.jpg'
import { remove } from '../store/reducer/authSlice';
import Modal from './Modal';

export default function Sidebar(props) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        dispatch(remove())
        localStorage.removeItem("token")
        navigate("/login")
    }

    const profile = useSelector((state) => state.auth.profile)

    const superAdminRoutes = [
        { to: "/admin", name: "Home" },
        { to: "/admin/manage-product", name: "Manage Product" },
        { to: "/admin/manage-category", name: "Manage Category" },
        { to: "/admin/manage-branch", name: "Manage Branch" },
        { to: "/admin/order", name: "Orders" },
        { to: "/admin/report", name: "Reports" },
    ]

    const adminRoutes = [
        { to: "/admin", name: "Home" },
        { to: "/admin/branch/manage-product", name: "Manage Product" },
        { to: "/admin/branch/manage-promotion", name: "Manage Promotion" },
        { to: "/admin/branch/manage-order", name: "Manage Orders" },
        { to: "/admin/branch/report", name: "Reports" },
    ]

    const profileRole = Number(profile.role)
    const role_id = 1

    const routes = profileRole === role_id ? superAdminRoutes : adminRoutes
    return (
        <div className="flex flex-col items-center lg:h-screen lg:w-full lg:bg-cover lg:bg-center lg:px-4 z-50" style={{ backgroundImage: `url(${backgroundSideBar})`, backgroundSize: `cover` }}>
            <div className="hidden lg:block lg:my-6">
                <img src={logo} alt="logo" />
            </div>
            <div className="hidden lg:flex flex-col w-auto lg:items-center text-darkgrey font-inter text-xl">
                <ul className="py-4">
                    {routes.map(({ to, name }, idx) => (
                        <Link key={idx} to={to} className="h-auto">
                            <li className={`px-2 py-2 w-full border-b border-lightgrey ${location.pathname === to ? `text-maingreen font-bold` : ``}`}>{name}</li>
                        </Link>
                    ))}
                    <Modal onClickButton={handleLogout} modalTitle={"Log Out"} toggleName={"Log Out"} content={"Are you sure you want to log out?"} buttonLabelOne={"Cancel"} buttonCondition={"logout"} buttonLabelTwo={"Yes"} className="px-2 py-2 w-full border-b border-lightgrey text-reddanger text-left" />
                </ul>
            </div>
            <div className={`lg:hidden fixed top-0 w-64 bg-cover bg-center font-inter text-darkgrey transform ${isMobileMenuOpen ? 'translate-x-0 left-0 h-screen shadow-md' : '-translate-x-full left-14 h-14'} transition-transform`} style={isMobileMenuOpen ? { backgroundImage: `url(${backgroundSideBar})`, backgroundSize: `cover` } : null}>
                <div className="flex justify-between p-4 pl-6 h-16" onClick={toggleMobileMenu}>
                    <img src={logo} alt="logo" />
                    {isMobileMenuOpen ? (<HiX className="text-maingreen w-6 h-6" />) : (<HiMenu className='text-maingreen w-6 h-6' />)}
                </div>
                <ul className={`${isMobileMenuOpen ? "pt-4 w-full flex flex-col items-center" : "hidden"}`}>
                    {routes.map(({ to, name }, idx) => (
                        <Link key={idx} to={to} className="h-auto w-9/12">
                            <li className={`px-2 py-2 border-b border-lightgrey ${location.pathname === to ? `text-maingreen font-bold` : ``}`}>{name}</li>
                        </Link>
                    ))}
                    <Modal onClickButton={handleLogout} modalTitle={"Log Out"} toggleName={"Log Out"} content={"Are you sure you want to log out?"} buttonLabelOne={"Cancel"} buttonCondition={"logout"} buttonLabelTwo={"Yes"} className="px-2 py-2 w-full border-b border-lightgrey text-reddanger text-left" />
                </ul>
            </div>
        </div>
    )
}
