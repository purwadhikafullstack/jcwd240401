import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { Pagination } from 'flowbite-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { keepLocation } from '../../store/reducer/locationSlice'
import ProductCard from '../../component/user/ProductCard'
import CarouselContent from '../../component/user/CarouselContent'
import SearchInputBar from '../../component/SearchInputBar'
import CustomDropdownURLSearch from '../../component/CustomDropdownURLSearch'

export default function HomeContent({cityAddress, provinceAddress, latitude, longitude}) {
    const [categories, setCategories] = useState([])
    const [productData, setProductData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [branchId, setBranchId] = useState("");
    const [branchCity, setBranchCity] = useState("")
    const [branchProvince, setBranchProvince] = useState("")
    const [filter, setFilter] = useState(new URLSearchParams());
    const params = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const getProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branch-products?latitude=${latitude}&longitude=${longitude}&page=${params.get("page") || 1}&search=${params.get("search") || ""}&filterCategory=${params.get("category_id") || ""}&sortName=${params.get("sortName") || ""}&sortPrice=${params.get("sortPrice") || ""}`)
            if (response.data) {
                setProductData(response.data)
                setBranchId(response.data.branchData.id)
                setBranchCity(response.data.branchData.City?.city_name)
                setBranchProvince(response.data.branchData.City?.Province?.province_name)
                dispatch(keepLocation({outOfReach: response.data.outOfReach}))
            } else {
                setProductData([])
            }
            if (response.data.pagination) {
                setTotalPages(Math.ceil(response.data?.pagination?.totalData / response.data?.pagination?.perPage))
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
        getProducts()
    }, [latitude, longitude, filter, currentPage])

    useEffect(() => {
        getCategory(branchId)
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

    const handleSearchValue = (searchValue) => {
        const newFilter = new URLSearchParams(filter.toString());
        newFilter.set("page", "1");
        if (searchValue === "") {
            newFilter.delete("search");
        } else {
            newFilter.set("search", searchValue);
        }
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        params.set("search", searchValue);
        params.set("page", "1");
        navigate({ search: params.toString() });
    };

    const nameOptions = [{ label: "Default", value: "" }, { label: "Product Name: A-Z", value: "ASC" }, { label: "Product Name: Z-A", value: "DESC" }]
    const priceOptions = [{ label: "Default", value: "" }, { label: "Price: Low-High", value: "ASC" }, { label: "Price: High-Low", value: "DESC" }]
  return (
    <div className="w-full flex flex-col items-center">
        <div className='relative mb-64 flex flex-col items-center w-full lg:flex lg:flex-col lg:static lg:my-10'>
            <div className="hidden lg:block font-inter text-sm w-full mb-2">Showing products from <span className='text-maingreen font-medium'>{`${branchCity}, ${branchProvince}`}</span> branch</div>
            <div className="w-full relative z-10 lg:hidden flex justify-center items-center h-10 min-h-max mb-2" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 50%, transparent 100%)' }}>
                <div className='w-11/12 flex gap-2'>
                    <HiOutlineLocationMarker className='w-6 h-6 text-white' />
                    <div className='font-inter text-white'>{`${cityAddress}, ${provinceAddress}`}</div>
                </div>
            </div>
            <div className="w-11/12 gap-2 lg:w-full mb-10 relative z-10">
                <div className="lg:hidden bg-white px-2 rounded-md font-inter text-sm mb-2">Showing products from <span className='text-maingreen font-medium'>{`${branchCity}, ${branchProvince}`}</span> branch</div>
                <SearchInputBar id="search" value={params.get("search") || ""} onSubmit={handleSearchValue} placeholder="Enter here to search product by name..." />
            </div>
            <div className="w-full gap-2 lg:w-full h-96 lg:h-64 absolute top-0 lg:static">
                <CarouselContent branchId={branchId} />
            </div>
        </div>
        <div className="w-11/12 gap-2 sm:w-9/12 lg:w-full h-fit flex overflow-x-auto lg:mb-10 mb-4">
            {categories.map((category) => (
                <div key={category.value} className='relative inline-block rounded-md bg-darkgrey' style={{ backgroundImage: `${category.imgCategory}`, backgroundSize: 'cover' }}>
                    <button id="category_id" onClick={() => handleCategoryChange(category.value)} className='w-full h-full whitespace-nowrap relative py-2 px-4'><div className={`absolute inset-0 bg-black w-full h-full rounded-md z-5 ${params.get("category_id") == category.value ? `bg-opacity-70 border-maingreen border-4` : `bg-black bg-opacity-40`}`}></div><span className={`relative font-inter text-white z-90`}>{category.label}</span></button>
                </div>
            ))}
        </div>
        <div className='w-11/12 gap-2 sm:w-9/12 lg:w-full flex lg:mb-10 mb-4'>
            <CustomDropdownURLSearch id="sortName" options={nameOptions} onChange={handleFilterChange} placeholder={"Sort by Name"} />
            <CustomDropdownURLSearch id="sortPrice" options={priceOptions} onChange={handleFilterChange} placeholder={"Sort by Price"} />
        </div>
        <div className='w-11/12 gap-2 sm:w-9/12 lg:w-full grid grid-cols-2  2xl:grid-cols-4 sm:gap-10 2xl:gap-2 mb-10 justify-center'>
            {productData?.data?.rows ? (productData?.data?.rows.map((product, index) => (
                <Link to={`/product/${branchId}/${product.Product?.name}/${product.Product?.weight}/${product.Product?.unitOfMeasurement}`}><div key={index} className='flex justify-center mb-2 sm:mb-0'>
                    <ProductCard key={index} product={product} productImg={`${process.env.REACT_APP_BASE_URL}${product.Product?.imgProduct}`} />
                </div> </Link>))
            ) : (<div className='font-inter col-span-2  2xl:col-span-4 text-center text-maingreen'>No Product Found</div>)}
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
