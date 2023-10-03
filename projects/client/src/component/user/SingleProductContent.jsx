import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { updateCart } from "../../store/reducer/cartSlice";
import Button from "../Button";
import SingleProductContentImage from "./productComponents/SingleProductContentImage";
import SingleProductContentDetails from "./productComponents/SingleProductContentDetails";
import SingleProductContentPriceBottom from "./productComponents/SingleProductContentPriceBottom";
import SingleProductContentPriceTop from "./productComponents/SingleProductContentPriceTop";
import AlertHelper from "../AlertHelper";
import { oneBranchProductForUser } from "../../api/branchProduct";

export default function SingleProductContent() {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [branchProductData, setBranchProductData] = useState({});
    const [quantity, setQuantity] = useState(1);
    const { branchId, name, weight, unitOfMeasurement } = useParams();
    const dispatch = useDispatch();
    const token = localStorage.getItem("token");
    const cartItems = useSelector((state) => state.cart.cart);
    const profile = useSelector((state) => state.auth.profile)
    const outOfReach = useSelector((state) => state.location.location.outOfReach)
    const navigate = useNavigate();

    const getOneBranchProduct = async () => {
        try {
            const response = await oneBranchProductForUser(branchId, name, weight, unitOfMeasurement)
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setBranchProductData(data);
                } else {
                    setBranchProductData([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    };

    useEffect(() => {
        getOneBranchProduct();
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [successMessage, errorMessage]);

    useEffect(() => {
        const cartItem = cartItems.find((item) => item.branch_product_id === branchProductData.id);
        if (cartItem) {
            setQuantity(cartItem.quantity);
        } else {
            setQuantity(0);
        }
    }, [cartItems, branchProductData.id]);

    const isProductInCart = cartItems.some((item) => item.branch_product_id === branchProductData.id);

    const updateQuantity = (action) => {
        if (
            branchProductData.Discount?.isExpired === false &&
            branchProductData.Discount?.discount_type_id === 1
        ) {
            if (action === "add" && quantity < 2) {
                setQuantity(quantity + 2);
            } else if (action === "reduce" && quantity >= 2) {
                setQuantity(quantity - 2);
            }
        } else {
            if (action === "add" && quantity < branchProductData.quantity) {
                setQuantity(quantity + 1);
            } else if (action === "reduce" && quantity > 0) {
                setQuantity(quantity - 1);
            }
        }
    };

    const handleSubmit = (id) => {
        if (!token) {
            navigate("/login");
        } else if (profile.status === false) {
            setQuantity(0)
            setErrorMessage("Account verification required to add cart")
        } else if (outOfReach === true) {
            setQuantity(0)
            setErrorMessage("Your location is out of reach, cannot add to cart")
        } else if (quantity === 0 && isProductInCart) {
            axios
                .delete(`${process.env.REACT_APP_API_BASE_URL}/users/carts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/carts`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                        .then((response) => {
                            dispatch(updateCart(response.data.data));
                            setSuccessMessage("Successfully removed from cart");
                        })
                        .catch((error) => {
                            console.error("Failed to fetch cart data", error.message);
                        });
                })
                .catch((error) => {
                    console.error("Failed to remove from cart", error.message);
                });
        } else if (quantity > 0 && quantity <= branchProductData.quantity) {
            axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/users/carts/${id}`,
                { quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            )
                .then((response) => {
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/carts`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                        .then((response) => {
                            dispatch(updateCart(response.data.data));
                            setSuccessMessage("Successfully add to cart");
                        })
                        .catch((error) => {
                            console.error("Failed to fetch cart data", error.message);
                        });
                })
                .catch((error) => {
                    console.error("Failed to add to cart", error.message);
                });
        }
    };

    return (
        <>
            {branchProductData ? (
                <div className="sm:py-4 sm:px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto">
                    <div className="">
                        <div className="hidden sm:flex justify-between">
                            <div className="grid justify-center content-center">
                                <div className="h-full w-full bg-white opacity-50"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                            </div>
                            <div className="flex mx-auto">
                                <div className="text-xl font-bold px-2">{branchProductData?.Product?.name}</div>
                                <div className="text-sm text-darkgrey px-2 flex items-center">{`${branchProductData?.Product?.weight}${branchProductData?.Product?.unitOfMeasurement} / pack`}</div>
                            </div>
                        </div>
                    </div>
                    <div className="fixed top-5 sm:top-10 md:top-20 z-50 flex self-center justify-center w-96 mx-2">
                        <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
                    </div>
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:mt-9">
                        <div>
                            <SingleProductContentImage imgUrl={`${process.env.REACT_APP_BASE_URL}${branchProductData?.Product?.imgProduct}`} branchDiscount={branchProductData.discount_id} branchDiscountExpired={branchProductData.Discount?.isExpired} branchDiscountId={branchProductData.Discount?.discount_type_id} branchProductStock={branchProductData.quantity} />
                            <SingleProductContentPriceTop productData={branchProductData} />
                        </div>
                        <div>
                            <SingleProductContentDetails productData={branchProductData} />
                            <SingleProductContentPriceBottom productData={branchProductData} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="basis-1/2 flex justify-around content-center items-center">
                            <Button condition={"minus"} size={"3xl"} onClick={(e) => updateQuantity("reduce")} />
                            <div className="h-fit">{quantity}</div>
                            <Button condition={"plus"} size={"3xl"} onClick={(e) => updateQuantity("add")} />
                        </div>
                        <div className="basis-1/2 p-4">
                            <Button condition={"positive"} label={isProductInCart && quantity === 0 ? (<div className="text-sm md:text-base">Remove from Cart</div>) : "Add to Cart"} onClick={(e) => handleSubmit(branchProductData.id)} isDisabled={!isProductInCart && quantity === 0 ? true : false} />
                            {branchProductData.Discount?.isExpired === false && branchProductData.Discount?.discount_type_id === 1 && quantity >= 2 ? (<div className="text-sm text-reddanger"> you can only add 2 for buy on get one product </div>) : (
                                quantity >= branchProductData.quantity && branchProductData.quantity !== 0 && (<div className="text-sm text-reddanger"> insufficient stock available</div>)
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-maingreen text-center mx-auto px-5">Loading...</div>
            )}
        </>
    );
}