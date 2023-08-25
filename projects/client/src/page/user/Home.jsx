import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { Carousel } from 'flowbite-react'
import NavbarTop from '../../component/NavbarTop'
import NavbarBottom from '../../component/NavbarBottom'
import Footer from '../../component/Footer'
import SearchBar from '../../component/SearchBar'
import ProductCard from '../../component/ProductCard'
import { Pagination } from 'flowbite-react'
import CustomDropdown from '../../component/CustomDropdown'
import shrimp from '../../assets/Seafood.jpg'
import bread from '../../assets/bread.jpg'
import CarouselContent from '../../component/user/CarouselContent'


export default function Home() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [error, setError] = useState("")
    const [cityAddress, setCityAddress] = useState("")
    const [provinceAddress, setProvinceAddress] = useState("")
    const [categories, setCategories] = useState([])
    const [productData, setProductData] = useState([])
    const [outOfReach, setOutOfReach] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filter, setFilter] = useState({
        search: "",
        sortName: "",
        sortPrice: ""
    })

    const token = localStorage.getItem("token")
    const profile = useSelector((state) => state.auth.profile)
    const bannerContent = [
        { product_id: "1", type: "Discount by percentage", amount: "20", name: "Shrimp", img: shrimp },
        { product_id: "2", type: "Buy one get one", amount: "", name: "Bread", img: bread }
    ]

    useEffect(() => {
        if (!token) {
            const askForLocationPermission = async () => {
                const permissionGranted = await new Promise((resolve) => {
                    const consent = window.confirm(
                        "Do you allow this app to access your location? If not, your location will be our default branch location"
                    );
                    resolve(consent)
                })

                if (permissionGranted) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            setLatitude(position.coords.latitude);
                            setLongitude(position.coords.longitude);
                            setError(null);
                        },
                        (error) => {
                            console.error("Error getting geolocation:", error.message)
                            setError("Error getting geolocation. Please allow location access.")
                        }
                    )
                } else {
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
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/address`, {
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
            getAddress()
        } else {
            setCityAddress("")
            setProvinceAddress("")
        }
    }, [token, profile])

    useEffect(() => {
        try {
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branch-products?latitude=${latitude}&longitude=${longitude}&page=${currentPage}&search=&filterCategory=&sortName=${filter.sortName}&sortPrice=${filter.sortPrice}`)
                .then((response) => {
                    if (response.data) {
                        setProductData(response.data.data?.rows)
                    }
                    if (response.data.pagination) {
                        setTotalPages(Math.ceil(response.data?.pagination?.totalData / response.data?.pagination?.perPage))
                    }
                    if(response.data.outOfReach === true){
                        setOutOfReach(true)
                    }
                })
        } catch (error) {
            if (error.response) {
                console.error(error.response.message)
            }
        }
    }, [latitude, longitude, filter.sortName, filter.sortPrice, currentPage])

    const city = (token && profile.role === "3") ? cityAddress : productData[0]?.Branch?.City?.city_name
    const province = (token && profile.role === "3") ? provinceAddress : productData[0]?.Branch?.City?.Province?.province_name

    useEffect(() => {
        try {
            axios.get(`http://localhost:8000/api/admins/no-pagination-categories`).then((response) => setCategories(response.data))
        } catch (error) {
            console.log(error)
        }
    }, [])

    const handleSearchValue = (e) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            search: e.target.value,
        }));
    }

    const onPageChange = (page) => {
        setProductData([]);
        setCurrentPage(page)
    }

    const handleChangeDropdown = (obj, name) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: obj.value,
        }));
    };
    const nameOptions = [{ label: "Default", value: "" }, { label: "Product Name: A-Z", value: "ASC" }, { label: "Product Name: Z-A", value: "DESC" }]
    const priceOptions = [{ label: "Default", value: "" }, { label: "Price: Low-High", value: "ASC" }, { label: "Price: High-Low", value: "DESC" }]

    return (
        <>
            <NavbarTop city={city} province={province} />
            <div className="w-full flex flex-col items-center">
                <div className="w-6/12 my-10">
                    <SearchBar value={filter.search} type="text" onChange={handleSearchValue} placeholder={"Search Product"} />
                </div>
                <div className="w-6/12 h-64 mb-10">
                    <Carousel>
                        {bannerContent.map((banner) => (
                            <CarouselContent key={banner.product_id} type={banner.type} amount={banner.amount} name={banner.name} image={banner.img}/>
                        ))}
                    </Carousel>
                </div>
                <div className="w-6/12 h-auto flex gap-4 overflow-x-auto mb-10">
                    {categories.data?.map((category) => (
                        <div key={category.id} className='relative inline-block p-2 rounded-md' style={{ backgroundImage: `url(http://localhost:8000${category.imgCategory})`, backgroundSize: 'cover' }}>
                            <div className="absolute inset-0 bg-black bg-opacity-40 w-full h-full rounded-md"></div>
                            <button className='w-auto font-inter text-white whitespace-nowrap relative z-10'>{category.name}</button>
                        </div>
                    ))}
                </div>
                <div className='w-6/12 flex gap-5 mb-10'>
                    <CustomDropdown options={nameOptions} onChange={(e) => handleChangeDropdown(e, "sortName")} placeholder={"Sort by Name"} />
                    <CustomDropdown options={priceOptions} onChange={(e) => handleChangeDropdown(e, "sortPrice")} placeholder={"Sort by Price"} />
                </div>
                <div className='w-6/12 flex mb-20 justify-evenly'>
                    {productData.map((product, index) => (
                        <ProductCard key={index} productName={product.Product?.name} productBasePrice={product.Product?.basePrice} productImg={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProduct}`} latitude={latitude} outOfReach={outOfReach}/>
                    ))}
                </div>
                <div className='flex justify-center'>
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
