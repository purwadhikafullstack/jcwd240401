import React, { useState, useEffect } from 'react'
import { Pagination } from 'flowbite-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { HiOutlineLocationMarker, HiOutlineInformationCircle, HiX } from 'react-icons/hi'

import { keepLocation } from '../../store/reducer/locationSlice'
import ProductCard from '../../component/user/ProductCard'
import CarouselContent from '../../component/user/CarouselContent'
import SearchInputBar from '../../component/SearchInputBar'
import CustomDropdownURLSearch from '../../component/CustomDropdownURLSearch'
import { productsForUser } from '../../api/product'
import { categoryForUserByBranchId } from '../../api/category'

export default function HomeContent({ cityAddress, provinceAddress, latitude, longitude }) {
    const [categories, setCategories] = useState([])
    const [productData, setProductData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [branchId, setBranchId] = useState("");
    const [branchCity, setBranchCity] = useState("")
    const [info, setInfo] = useState(false)
    const [branchProvince, setBranchProvince] = useState("")
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const token = localStorage.getItem("token")

    const getProducts = async () => {
        try {
            const response = await productsForUser(latitude, longitude, params.get("page") || 1, params.get("search") || "", params.get("category_id") || "", params.get("sortName") || "", params.get("sortPrice") || "")
            if (response.data) {
                setProductData(response.data)
                setBranchId(response.data.branchData.id)
                setBranchCity(response.data.branchData.City?.city_name)
                setBranchProvince(response.data.branchData.City?.Province?.province_name)
                dispatch(keepLocation({ outOfReach: response.data.outOfReach }))
            } else {
                setProductData([])
            }
            if (response.data.pagination) {
                setTotalPages(Math.ceil(response.data?.pagination?.totalData / response.data?.pagination?.perPage))
            }
        } catch (error) {
            if (error.response) {
                console.log(error.message)
            }
        }
    }

    const getCategory = async (id) => {
        try {
            const response = await categoryForUserByBranchId(id)
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
                console.log(error.message)
            }
        }
    }

    useEffect(() => {
        getProducts()
    }, [latitude, longitude, filter, currentPage])

    useEffect(() => {
        if (branchId) {
            getCategory(branchId)
        }
    }, [branchId])

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

    const handleFilterChange = (paramName, paramValue) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (paramValue === "") {
            newFilter.delete(paramName);
        } else {
            newFilter.set(paramName, paramValue);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set(paramName, paramValue);
        params.set("page", "1");
        navigate({ search: params.toString() });
    };

    const nameOptions = [{ label: "Default", value: "" }, { label: "Product Name: A-Z", value: "ASC" }, { label: "Product Name: Z-A", value: "DESC" }]
    const priceOptions = [{ label: "Default", value: "" }, { label: "Price: Low-High", value: "ASC" }, { label: "Price: High-Low", value: "DESC" }]
    return (
        <div className="w-full flex flex-col items-center">
            <div className='relative mb-64 flex flex-col items-center w-full lg:flex lg:flex-col lg:static lg:my-10'>
                <div className='hidden lg:flex lg:items-center lg:w-full lg:gap-2 font-inter text-sm mb-2 '>
                    <div className="">Showing products from <span className='text-maingreen font-medium'>{`${branchCity}, ${branchProvince}`}</span> branch</div>
                    {token ? info ? <HiX className='h-6 w-6 text-blue-500' onClick={() => { setInfo(false) }} /> : <HiOutlineInformationCircle className='h-6 w-6 text-blue-500' onClick={() => setInfo(true)} /> : null}
                </div>
                {info ? (
                    <div className='hidden lg:flex sm:items-center sm:justify-between sm:text-sm sm:w-full font-inter py-2 px-4 rounded-lg bg-blue-100 mb-2'>
                        <div>Products are shown from the nearest branch of your main address</div>
                        <Link to="/user/account/my-address" className="text-sm text-maingreen font-inter font-medium hover:font-bold">Change Address</Link>
                    </div>
                ) : (null)}
                <div className="w-screen relative z-10 lg:hidden flex justify-center items-center h-10 min-h-max mb-2" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 50%, transparent 100%)' }}>
                    <div className='w-11/12 flex gap-2'>
                        <HiOutlineLocationMarker className='w-6 h-6 text-white' />
                        <div className='font-inter text-white'>{`${cityAddress}, ${provinceAddress}`}</div>
                    </div>
                </div>
                <div className="w-11/12 gap-2 lg:w-full mb-10 relative z-10">
                    <div className='lg:hidden bg-white px-2 rounded-md font-inter text-sm mb-2 w-full flex gap-2 items-center'>
                        <div className="">Showing products from <span className='text-maingreen font-medium'>{`${branchCity}, ${branchProvince}`}</span> branch</div>
                        {token ? info ? <HiX className='h-6 w-6 text-blue-500' onClick={() => { setInfo(false) }} /> : <HiOutlineInformationCircle className='h-6 w-6 text-blue-500' onClick={() => setInfo(true)} /> : null}
                    </div>
                    {info ? (
                        <div className='lg:hidden absolute z-50 flex items-center justify-between text-sm w-full font-inter py-2 px-4 rounded-lg bg-blue-100 mb-2'>
                            <div>Products are shown from the nearest branch of your main address</div>
                            <Link to="/user/account/my-address" className="text-sm text-maingreen font-inter font-medium hover:font-bold">Change Address</Link>
                        </div>
                    ) : (null)}
                    <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={(searchValue) => handleFilterChange("search", searchValue)} placeholder="Enter here to search product by name..." />
                </div>
                <div className="w-full gap-2 lg:w-full h-96 lg:h-64 absolute top-0 lg:static">
                    <CarouselContent branchId={branchId} />
                </div>
            </div>
            <div className="w-11/12 gap-2 sm:w-9/12 lg:w-full h-fit flex overflow-x-auto lg:mb-10 mb-4">
                {categories.map((category) => (
                    <div key={category.value} className='relative inline-block rounded-md bg-darkgrey' style={{ backgroundImage: `${category.imgCategory}`, backgroundSize: 'cover' }}>
                        <button id="category_id" onClick={(e) => handleFilterChange("category_id", category.value)} className='w-full h-full whitespace-nowrap relative py-2 px-4'><div className={`absolute inset-0 bg-black w-full h-full rounded-md z-5 ${params.get("category_id") == category.value ? `bg-opacity-70 border-maingreen border-4` : `bg-black bg-opacity-40`}`}></div><span className={`relative font-inter text-white z-90`}>{category.label}</span></button>
                    </div>
                ))}
            </div>
            <div className='w-11/12 gap-2 sm:w-9/12 lg:w-full flex lg:mb-10 mb-4'>
                <CustomDropdownURLSearch id="sortName" options={nameOptions} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Name"} />
                <CustomDropdownURLSearch id="sortPrice" options={priceOptions} onChange={(e) => handleFilterChange(e.target.id, e.target.value)} placeholder={"Sort by Price"} />
            </div>
            <div className='w-11/12 gap-2 sm:w-9/12 lg:w-full grid grid-cols-2 lg:grid-cols-4 sm:gap-1 mb-10 justify-center'>
                {productData?.data?.rows ? (productData?.data?.rows.map((product, index) => (
                    <Link to={`/product/${branchId}/${product.Product?.name}/${product.Product?.weight}/${product.Product?.unitOfMeasurement}`} key={index}><div className='flex justify-center mb-2 sm:mb-0'>
                        <ProductCard key={index} product={product} productImg={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProduct}`} />
                    </div> </Link>))
                ) : (<div className='font-inter col-span-2 lg:col-span-4 text-center text-maingreen'>No Product Found</div>)}
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
    )
}
