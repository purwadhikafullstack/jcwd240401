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
        { to: "/admin/manage-product", tab: ["all-product", "create-product"], name: "Manage Product" },
        { to: "/admin/manage-category", tab: ["all-category", "create-category"], name: "Manage Category" },
        { to: "/admin/manage-branch", tab: ["all-branch", "create-branch"], name: "Manage Branch" },
        { to: "/admin/order", tab: ["order-list"], name: "Orders" },
        { to: "/admin/report", tab: ["sales-report", "stock-report"], name: "Reports" },
    ]

    const adminRoutes = [
        { to: "/admin", name: "Home" },
        { to: "/admin/branch/manage-product", tab: ["my-branch-product", "create-branch-product"], name: "Manage Product" },
        { to: "/admin/branch/manage-promotion", tab: ["my-discount", "my-voucher"], name: "Manage Promotion" },
        { to: "/admin/branch/manage-order", tab: ["order-list"], name: "Manage Orders" },
        { to: "/admin/branch/report", tab: ["sales-report", "stock-report"], name: "Reports" },
    ]

    const profileRole = Number(profile.role)
    const role_id = 1

    const routes = profileRole === role_id ? superAdminRoutes : adminRoutes
    return (
        <div className="flex flex-col items-center lg:h-full lg:w-full lg:bg-cover lg:bg-center lg:px-4 z-50" style={{ backgroundImage: `url(${backgroundSideBar})`, backgroundSize: `cover` }}>
            <div className="hidden lg:block lg:my-6">
                <img src={logo} alt="logo" />
            </div>
            <div className="hidden lg:flex flex-col w-auto lg:items-center font-inter text-xl">
                <ul className="py-4">
                    {routes.map(({ to, tab, name }, idx) => (
                        <Link key={idx} to={`${to}${tab ? `?tab=${tab[0]}` : ''}`} className="h-auto">
                            <li className={`p-2 w-52 border-b border-lightgrey ${location.pathname === to && (tab ? location.search.includes(`tab=${tab[0]}`) || location.search.includes(`tab=${tab[1]}`) : true) ? 'text-maingreen font-bold' : 'text-darkgrey'}`}>{name}</li>
                        </Link>
                    ))}
                    <Modal onClickButton={handleLogout} modalTitle={"Log Out"} toggleName={"Log Out"} content={"Are you sure you want to log out?"} buttonLabelOne={"Cancel"} buttonCondition={"logout"} buttonLabelTwo={"Yes"} />
                </ul>
            </div>
            <div className={`lg:hidden fixed top-0 w-64 bg-cover bg-center font-inter text-darkgrey transform ${isMobileMenuOpen ? 'translate-x-0 left-0 h-screen shadow-md' : '-translate-x-full left-14 h-14'} transition-transform`} style={isMobileMenuOpen ? { backgroundImage: `url(${backgroundSideBar})`, backgroundSize: `cover` } : null}>
                <div className="flex justify-between p-4 pl-6 h-16" onClick={toggleMobileMenu}>
                    <img src={logo} alt="logo" />
                    {isMobileMenuOpen ? (<HiX className="text-maingreen w-6 h-6 cursor-pointer" />) : (<HiMenu className='text-maingreen w-6 h-6 bg-white cursor-pointer' />)}
                </div>
                <ul className={`${isMobileMenuOpen ? "pt-4 w-full flex flex-col items-center" : "hidden"}`}>
                    {routes.map(({ to, tab, name }, idx) => (
                        <Link key={idx} to={`${to}${tab ? `?tab=${tab[0]}` : ''}`} className="h-auto w-52">
                            <li className={`p-2 border-b border-lightgrey ${location.pathname === to && (tab ? location.search.includes(`tab=${tab[0]}`) || location.search.includes(`tab=${tab[1]}`) : true) ? 'text-maingreen font-bold' : 'text-darkgrey'}`}>{name}</li>
                        </Link>
                    ))}
                    <Modal onClickButton={handleLogout} modalTitle={"Log Out"} toggleName={"Log Out"} content={"Are you sure you want to log out?"} buttonLabelOne={"Cancel"} buttonCondition={"logout"} buttonLabelTwo={"Yes"} />
                </ul>
            </div>
        </div>
    )
}
