import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import NavbarTop from '../../component/NavbarTop'
import NavbarBottom from '../../component/NavbarBottom'
import Footer from '../../component/Footer'
import SearchBar from '../../component/SearchBar'
import ProductCard from '../../component/ProductCard'
import { Pagination } from 'flowbite-react'
import CarouselContent from '../../component/user/CarouselContent'
import { Link, useNavigate } from 'react-router-dom'
import CustomDropdownProduct from '../../component/CustomDropdownProduct'

export default function Home() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [error, setError] = useState("")
    const [cityAddress, setCityAddress] = useState("")
    const [provinceAddress, setProvinceAddress] = useState("")
    const [cityCoordinaes, setCityCoordinates] = useState("")
    const [provinceCoordinates, setProvinceCoordinates] = useState("")
    const [categories, setCategories] = useState([])
    const [productData, setProductData] = useState([])
    const [outOfReach, setOutOfReach] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoadingPlacename, setIsLoadingPlacename] = useState(true);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [locationReady, setLocationReady] = useState(false);
    const [branchId, setBranchId] = useState("");
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const token = localStorage.getItem("token")
    const profile = useSelector((state) => state.auth.profile)

    const coordinateToPlacename = async () => {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/location?latitude=${latitude}&longitude=${longitude}`)
        if (response.data) {
            if (response.data.data?.city === "Daerah Khusus Ibukota Jakarta") {
                setCityCoordinates(response.data.data?.city_district)
                setProvinceCoordinates("DKI Jakarta")
            } else {
                setCityCoordinates(response.data.data?.city)
                setProvinceCoordinates(response.data.data?.state)
            }
        }
    }

    useEffect(() => {
        if (!isLoadingPlacename && locationPermissionGranted) {
            coordinateToPlacename();
        }
    }, [isLoadingPlacename, locationPermissionGranted]);

    useEffect(() => {
        if (latitude !== "" && longitude !== "") {
            setIsLoadingPlacename(true);
            coordinateToPlacename()
                .then(() => {
                    setIsLoadingPlacename(false);
                })
                .catch((error) => {
                    console.error("Error fetching placename:", error);
                    setIsLoadingPlacename(false);
                });
        }
    }, [latitude, longitude]);

    console.log("latitude", latitude)
    console.log("longitude", longitude)

    useEffect(() => {
        if (!token) {
            const askForLocationPermission = async () => {
                const permissionGranted = await new Promise((resolve) => {
                    const consent = window.confirm(
                        "Do you allow this app to access your location? If not, your location will be our default branch location"
                    );
                    resolve(consent)
                })
                setLocationPermissionGranted(permissionGranted)
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
                        setLocationReady(true)
                        setError(null);
                    } catch (error) {
                        console.error("Error getting geolocation:", error.message);
                        setError("Error getting geolocation. Please allow location access.");
                    }
                } else {
                    setLocationReady(true)
                    setError("Location access denied.");
                }
            }
            if ("geolocation" in navigator) {
                askForLocationPermission();
            } else {
                setError("Geolocation is not supported by your browser.")
            }
        }
    }, [token]);

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
        if (token && profile.role === "3") {
            getAddress().then(() => {
                setLocationReady(true)
            })
        } else {
            setLocationReady(true)
            setCityAddress("")
            setProvinceAddress("")
        }
    }, [token, profile])

    const getProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branch-products?latitude=${latitude}&longitude=${longitude}&page=${params.get("page") || 1}&search=${params.get("search") || ""}&filterCategory=${params.get("category_id") || ""}&sortName=${params.get("sortName") || ""}&sortPrice=${params.get("sortPrice") || ""}`)
            if (response.data) {
                setProductData(response.data)
                setBranchId(response.data.branchData.id)
            } else {
                setProductData([])
            }
            if (response.data.pagination) {
                setTotalPages(Math.ceil(response.data?.pagination?.totalData / response.data?.pagination?.perPage))
            }
            if (response.data.outOfReach === true) {
                setOutOfReach(true)
            }
        } catch (error) {
            if (error.response) {
                console.log(error.response.message)
            }
        }
    }

    const getCategory = async (id) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branchs/${id}/categories`);
            if (response) {
                const data = response.data.data;
                if (data) {
                    const option = { label: "All", value: "" }
                    let options = data.map((d) => ({
                        label: d.name,
                        value: d.id,
                        imgCategory: `url(${process.env.REACT_APP_BASE_URL}${d.imgCategory})`
                    }));
                    options.unshift(option)
                    setCategories(options)
                } else {
                    setCategories([]);
                }
            }
        } catch (error) {
            console.log(error)
            if (error.response) {
                console.log(error.response.message)
            }
        }
    }

    useEffect(() => {
        if (locationReady) {
            getProducts()
        }
    }, [latitude, longitude, filter, currentPage, locationReady])

    const city = (token && profile.role === "3") ? cityAddress : locationPermissionGranted ? cityCoordinaes : productData.branchData?.City?.city_name
    const province = (token && profile.role === "3") ? provinceAddress : locationPermissionGranted ? provinceCoordinates : productData.branchData?.City?.Province?.province_name

    useEffect(() => {
        getCategory(branchId)
    }, [branchId])

    console.log("city coordinate", cityAddress)

    const onPageChange = (page) => {
        setProductData([]);
        setCurrentPage(page);

        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", page.toString());

        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", page.toString());
        navigate({ search: params.toString() });
    };

    const handleFilterChange = (e) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (e.target.value === "") {
            newFilter.delete(e.target.id);
        } else {
            newFilter.set(e.target.id, e.target.value);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", "1");
        params.set(e.target.id, e.target.value);
        navigate({ search: params.toString() });
    };

    const handleCategoryChange = (categoryId) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (categoryId === "") {
            newFilter.delete("category_id");
        } else {
            newFilter.set("category_id", categoryId);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("page", "1");
        params.set("category_id", categoryId);
        navigate({ search: params.toString() });
    };

    const handleSearchValue = (e) => {
        const newFilter = new URLSearchParams(filter.toString());
        const newSearchValue = e.target.value;
        newFilter.set("page", "1");
        if (newSearchValue === "") {
            newFilter.delete("search");
        } else {
            newFilter.set("search", newSearchValue);
        }
        setFilter(newFilter);

        const params = new URLSearchParams(window.location.search);
        params.set("search", newSearchValue);
        params.set("page", "1");
        navigate({ search: params.toString() });
    };


    const nameOptions = [{ label: "Default", value: "" }, { label: "Product Name: A-Z", value: "ASC" }, { label: "Product Name: Z-A", value: "DESC" }]
    const priceOptions = [{ label: "Default", value: "" }, { label: "Price: Low-High", value: "ASC" }, { label: "Price: High-Low", value: "DESC" }]

    return (
        <>
            <NavbarTop city={city} province={province} />
            <div className="w-full flex flex-col items-center">
                <div className="w-11/12 gap-2 sm:w-9/12 lg:w-6/12 my-10">
                    <SearchBar value={params.get("search") || ""} type="text" onChange={handleSearchValue} placeholder={"Search Product"} />
                </div>
                <div className="w-11/12 gap-2 sm:w-9/12 lg:w-6/12 h-64 mb-10">
                    <CarouselContent />
                </div>
                <div className="w-11/12 gap-2 sm:w-9/12 lg:w-6/12 h-fit flex overflow-x-auto mb-10">
                    {categories.map((category) => (
                        <div key={category.value} className='relative inline-block rounded-md' style={{ backgroundImage: `${category.imgCategory}`, backgroundSize: 'cover' }}>
                            <button id="category_id" onClick={() => handleCategoryChange(category.value)} className='w-full h-full whitespace-nowrap relative py-2 px-4'><div className="absolute inset-0 bg-black bg-opacity-40 w-full h-full rounded-md z-5"></div><span className='relative font-inter text-white z-90'>{category.label}</span></button>
                        </div>
                    ))}
                </div>
                <div className='w-11/12 gap-2 sm:w-9/12 lg:w-6/12 flex mb-10'>
                    <CustomDropdownProduct id="sortName" options={nameOptions} onChange={handleFilterChange} placeholder={"Sort by Name"} />
                    <CustomDropdownProduct id="sortPrice" options={priceOptions} onChange={handleFilterChange} placeholder={"Sort by Price"} />
                </div>
                <div className='w-11/12 gap-2 sm:w-9/12 lg:w-6/12 grid grid-cols-2  2xl:grid-cols-4 sm:gap-10 mb-10 justify-center'>
                    {productData?.data?.rows ? (productData?.data?.rows.map((product, index) => (
                        <Link to={`/product/${product.Product?.name}`}><div key={index} className='flex justify-center mb-2 sm:mb-0'>
                            <ProductCard key={index} product={product} productImg={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProduct}`} latitude={latitude} outOfReach={outOfReach} />
                        </div> </Link>))
                    ) : (<div className='font-inter col-span-2 text-center text-maingreen'>No Product Found</div>)}
                </div>
                <div className='flex justify-center mb-10'>
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                        showIcons
                        layout="pagination"
                        totalPages={totalPages}
                        nextLabel="Next"
                        previousLabel="Back"
                        className="mx-auto"
                    />
                </div>
            </div>
            <NavbarBottom />
            <Footer />
        </>
    )
}
