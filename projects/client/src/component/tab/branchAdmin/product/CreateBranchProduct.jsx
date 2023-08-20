import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as yup from "yup";
import { Formik, Form, Field } from 'formik';
import Modal from '../../../Modal';
import InputField from '../../../InputField';
import AlertPopUp from '../../../AlertPopUp';

export default function CreateBranchProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allProduct, setAllProduct] = useState([]);
    const [allDiscount, setAllDiscount] = useState([]);

    const handleShowAlert = () => {
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }
    const handleHideAlert = () => {
        setShowAlert(false)
    }

    // useEffect(() => {
    //     getCategory()
    // }, [])

    return (
        <div>CreateBranchProduct</div>
    )
}
