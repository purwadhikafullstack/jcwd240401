import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateCart } from "../../store/reducer/cartSlice";

import AlertPopUp from "../AlertPopUp";
import Button from "../Button";
import Label from "../Label";
import rupiah from "../../helpers/rupiah";

export default function SingleProductContent() {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [branchProductData, setBranchProductData] = useState({});
    const [quantity, setQuantity] = useState(1);
    const { branchId, name, weight, unitOfMeasurement } = useParams();
    const dispatch = useDispatch();
    const token = localStorage.getItem("token");
    const cartItems = useSelector((state) => state.cart.cart);
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const getOneBranchProduct = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL
                }/users/branch-products/${branchId}/${encodeURIComponent(name)}/${weight}/${unitOfMeasurement}`
            );
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

    console.log(branchProductData, "branch");

    useEffect(() => {
        getOneBranchProduct();
    }, [successMessage]);

    useEffect(() => {
        const cartItem = cartItems.find(
            (item) => item.branch_product_id === branchProductData.id
        );
        if (cartItem) {
            setQuantity(cartItem.quantity);
        } else {
            setQuantity(0);
        }
    }, [cartItems, branchProductData.id]);

    const isProductInCart = cartItems.some(
        (item) => item.branch_product_id === branchProductData.id
    );

    console.log(cartItems, "ini cartitems");

    const handleImageError = (event) => {
        event.target.src =
            "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
    };

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
            // For other types of discounts or no discount
            if (action === "add" && quantity < branchProductData.quantity) {
                setQuantity(quantity + 1);
            } else if (action === "reduce" && quantity > 0) {
                setQuantity(quantity - 1);
            }
        }
    };

    const handleHideAlert = () => {
        setShowAlert(false);
    };

    const handleSubmit = (id) => {
        if (!token) {
            navigate("/login");
        }
        if (quantity === 0 && isProductInCart) {
            axios
                .delete(`http://localhost:8000/api/users/carts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    axios
                        .get("http://localhost:8000/api/users/carts", {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .then((response) => {
                            dispatch(updateCart(response.data.data));
                            setSuccessMessage("Successfully removed from cart");
                            setShowAlert(true);
                        })
                        .catch((error) => {
                            console.error("Failed to fetch cart data", error.message);
                        });
                })
                .catch((error) => {
                    console.error("Failed to remove from cart", error.message);
                });
        } else if (quantity > 0 && quantity <= branchProductData.quantity) {
            axios
                .post(
                    `http://localhost:8000/api/users/carts/${id}`,
                    { quantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .then((response) => {
                    axios
                        .get("http://localhost:8000/api/users/carts", {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .then((response) => {
                            dispatch(updateCart(response.data.data));
                            setSuccessMessage("Successfully add to cart");
                            setShowAlert(true);
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

    if (!branchProductData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {branchProductData.length !== 0 ? (
                <div className="sm:py-4 sm:px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto">
                    <div className="">
                        <div className="hidden sm:flex justify-between">
                            <div className="grid justify-center content-center">
                                <Button condition={"back"} onClick={goBack} />
                            </div>
                            <div className="flex mx-auto">
                                <div className="text-xl font-bold px-2">
                                    {branchProductData?.Product?.name}
                                </div>
                                <div className="text-sm text-darkgrey px-2 flex items-center">{`${branchProductData?.Product?.weight}${branchProductData?.Product?.unitOfMeasurement} / pack`}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex self-center justify-center w-96">
                        {showAlert ? (
                            <AlertPopUp
                                condition={errorMessage ? "fail" : "success"}
                                content={errorMessage ? errorMessage : successMessage}
                                setter={handleHideAlert}
                            />
                        ) : null}
                    </div>
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:mt-9">
                        <div>
                            <div className="grid h-full content-center">
                                <div className="relative h-fit">
                                    <div className="absolute top-3 left-1 grid justify-center content-center sm:hidden">
                                        <Button condition={"back"} onClick={goBack} />
                                    </div>
                                    {branchProductData.discount_id &&
                                        branchProductData.Discount?.isExpired === false ? (
                                        <div className="absolute bottom-0 left-0 h-8 w-full bg-reddanger flex justify-start text-sm items-center text-white font-inter px-4 sm:rounded-b-lg">
                                            {branchProductData.Discount.discount_type_id === 1
                                                ? "Buy 1 Get 1"
                                                : "Discount"}
                                        </div>
                                    ) : null}
                                    <img
                                        className="w-full h-fit justify-center mx-auto object-cover sm:rounded-lg"
                                        src={`${process.env.REACT_APP_BASE_URL}${branchProductData?.Product?.imgProduct}`}
                                        onError={handleImageError}
                                        alt="/"
                                    />
                                </div>
                            </div>
                            <div className="sm:hidden grid p-4">
                                <div>{branchProductData?.Product?.name}</div>
                                <div className="text-sm text-darkgrey flex items-center">{`${branchProductData?.Product?.weight}${branchProductData?.Product?.unitOfMeasurement} / pack`}</div>
                                <div className="py-3">
                                    {" "}
                                    {branchProductData.discount_id &&
                                        branchProductData?.Discount?.isExpired === false ? (
                                        <>
                                            {branchProductData.Discount.discount_type_id === 1 ? (
                                                <div className="text-reddanger font-bold">
                                                    {rupiah(branchProductData.Product.basePrice)}
                                                </div>
                                            ) : branchProductData.Discount.discount_type_id === 2 ? (
                                                <>
                                                    <div className="text-reddanger font-bold">
                                                        {rupiah(
                                                            branchProductData.Product.basePrice -
                                                            (branchProductData.Product.basePrice *
                                                                branchProductData.Discount.amount) /
                                                            100
                                                        )}
                                                    </div>
                                                    <div className="text-xs flex items-center gap-3">
                                                        <div>
                                                            <Label
                                                                labelColor={"red"}
                                                                text={`${branchProductData.Discount.amount} %`}
                                                            />
                                                        </div>
                                                        <del>
                                                            {rupiah(branchProductData.Product.basePrice)}
                                                        </del>
                                                    </div>
                                                </>
                                            ) : branchProductData.Discount.discount_type_id === 3 ? (
                                                <>
                                                    <div className="text-reddanger font-bold">
                                                        {rupiah(
                                                            branchProductData.Product.basePrice -
                                                            branchProductData.Discount.amount
                                                        )}
                                                    </div>
                                                    <div className="text-xs flex items-center gap-3">
                                                        <del>
                                                            {rupiah(branchProductData.Product.basePrice)}
                                                        </del>
                                                    </div>
                                                </>
                                            ) : null}
                                        </>
                                    ) : (
                                        <div className="text-reddanger font-bold">
                                            {rupiah(branchProductData?.Product?.basePrice)}
                                        </div>
                                    )}{" "}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="p-4 bg-lightgrey w-full h-fit text-darkgrey text-sm">
                                {branchProductData?.Product?.description}
                            </div>
                            <div className="p-4">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="py-2 text-left" colSpan={2}>
                                                Product Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        <tr>
                                            <td
                                                className="py-2 text-maindarkgreen align-top"
                                                style={{ width: "40%" }}
                                            >
                                                Stock
                                            </td>
                                            <td className="p-2" style={{ width: "60%" }}>
                                                {branchProductData?.quantity} Qty
                                            </td>
                                        </tr>
                                        <tr>
                                            <td
                                                className="py-2 text-maindarkgreen align-top"
                                                style={{ width: "40%" }}
                                            >
                                                Origin
                                            </td>
                                            <td className="p-2" style={{ width: "60%" }}>
                                                {branchProductData?.origin}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td
                                                className="py-2 text-maindarkgreen align-top"
                                                style={{ width: "40%" }}
                                            >
                                                Storage Instruction
                                            </td>
                                            <td className="p-2" style={{ width: "60%" }}>
                                                {branchProductData?.Product?.storageInstruction}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td
                                                className="py-2 text-maindarkgreen align-top"
                                                style={{ width: "40%" }}
                                            >
                                                Storage Period
                                            </td>
                                            <td className="p-2" style={{ width: "60%" }}>
                                                {branchProductData?.Product?.storagePeriod}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 hidden sm:block">
                                {branchProductData.discount_id &&
                                    branchProductData?.Discount?.isExpired === false ? (
                                    <>
                                        {branchProductData.Discount.discount_type_id === 1 ? (
                                            <div className="text-reddanger font-bold">
                                                {rupiah(branchProductData.Product.basePrice)}
                                            </div>
                                        ) : branchProductData.Discount.discount_type_id === 2 ? (
                                            <>
                                                <div className="text-reddanger font-bold">
                                                    {rupiah(
                                                        branchProductData.Product.basePrice -
                                                        (branchProductData.Product.basePrice *
                                                            branchProductData.Discount.amount) /
                                                        100
                                                    )}
                                                </div>
                                                <div className="text-xs flex items-center gap-3">
                                                    <div>
                                                        <Label
                                                            labelColor={"red"}
                                                            text={`${branchProductData.Discount.amount} %`}
                                                        />
                                                    </div>
                                                    <del>
                                                        {rupiah(branchProductData.Product.basePrice)}
                                                    </del>
                                                </div>
                                            </>
                                        ) : branchProductData.Discount.discount_type_id === 3 ? (
                                            <>
                                                <div className="text-reddanger font-bold">
                                                    {rupiah(
                                                        branchProductData.Product.basePrice -
                                                        branchProductData.Discount.amount
                                                    )}
                                                </div>
                                                <div className="text-xs flex items-center gap-3">
                                                    <del>
                                                        {rupiah(branchProductData.Product.basePrice)}
                                                    </del>
                                                </div>
                                            </>
                                        ) : null}
                                    </>
                                ) : (
                                    <div className="text-reddanger font-bold">
                                        {rupiah(branchProductData?.Product?.basePrice)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="basis-1/2 flex justify-around content-center items-center">
                            <Button
                                condition={"minus"}
                                size={"3xl"}
                                onClick={(e) => updateQuantity("reduce")}
                            />
                            <div className="h-fit">{quantity}</div>
                            <Button
                                condition={"plus"}
                                size={"3xl"}
                                onClick={(e) => updateQuantity("add")}
                            />
                        </div>
                        <div className="basis-1/2 p-4">
                            <Button
                                condition={"positive"}
                                label={
                                    isProductInCart && quantity === 0
                                        ? "Remove from Cart"
                                        : "Add to Cart"
                                }
                                onClick={(e) => handleSubmit(branchProductData.id)}
                                isDisabled={!isProductInCart && quantity === 0 ? true : false}
                            />
                            {branchProductData.Discount?.isExpired == false &&
                                branchProductData.Discount?.discount_type_id === 1 &&
                                quantity >= 2 ? (
                                <div className="text-sm text-reddanger">
                                    you can only add 2 for buy on get one product
                                </div>
                            ) : (
                                quantity >= branchProductData.quantity && (
                                    <div className="text-sm text-reddanger">
                                        insufficient stock available
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-maingreen text-center mx-auto px-5">
                    Loading...
                </div>
            )}
        </>
    );
}
