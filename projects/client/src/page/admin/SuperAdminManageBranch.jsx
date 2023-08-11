import React, {useState} from 'react'
import {useFormik} from 'formik'
import axios from 'axios'
import { registerSchema } from '../../helpers/validationSchema'
import AlertPopUp from '../../component/AlertPopUp'
import InputField from '../../component/InputField'
import Button from '../../component/Button'
import Sidebar from '../../component/Sidebar'

export default function SuperAdminManageBranch() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const onSubmit = async(values, actions) => {
        try{
            const response = await axios.post("http://localhost:8000/api/auth/admins/register", values, {
                headers: {"Content-Type" : "application/json"}
            })
            if (response.status === 200){
                actions.resetForm()
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
            }
        }catch(error){
            if(error.response.status === 500){
                setErrorMessage("Login failed: Server error")
            }else if(error.response?.data?.message === "There's already an admin with this email"){
                setErrorMessage("There's already an admin with this email")
            }else if(error.response?.data?.message === "There's already a branch in this city"){
                setErrorMessage("There's already a branch in this city")
            }
        }
    }
    const {values, errors, touched, handleChange, handleBlur, handleSubmit} = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            province: "",
            city: "",
        },
        validationSchema: registerSchema,
        onSubmit
    })

    return (
        <>
        <div className="grid grid-cols-4">
            <Sidebar className="col-span-1" />
            <div className='col-span-3 flex justify-center items-center'>

        <div className='w-full h-screen flex justify-center items-center'>
            <div className="w-1/2 flex flex-col gap-2">
                <div className="w-full">
                    {errorMessage ? (<AlertPopUp condition={"fail"} content={errorMessage}/>) : (null)}
                    {successMessage ? (<AlertPopUp condition={"success"} content={successMessage} />) : (null)}
                </div>
                <form onSubmit={handleSubmit} autoComplete="off" className="w-full flex flex-col gap-2">
                    <div className="w-full">
                        <label htmlFor="name" className="font-inter">Name</label>
                        <InputField value={values.name} id={"name"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                        {errors.name && touched.name && <p className="text-reddanger text-sm font-inter">{errors.name}</p>}
                    </div>
                    <div className="w-full">
                        <label htmlFor="email" className="font-inter">Email</label>
                        <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                        {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                    </div>
                    <div className="w-full">
                        <label htmlFor="phone" className="font-inter">Phone</label>
                        <InputField value={values.phone} id={"phone"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                        {errors.phone && touched.phone && <p className="text-reddanger text-sm font-inter">{errors.phone}</p>}
                    </div>
                    <div className="w-full">
                        <label htmlFor="province" className="font-inter">Province</label>
                        <InputField value={values.province} id={"province"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                        {errors.province && touched.province && <p className="text-reddanger text-sm font-inter">{errors.province}</p>}
                    </div>
                    <div className="w-full">
                        <label htmlFor="city" className="font-inter">City</label>
                        <InputField value={values.city} id={"city"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                        {errors.city && touched.city && <p className="text-reddanger text-sm font-inter">{errors.city}</p>}
                    </div>
                    <div className="mt-10">
                        <Button label={"Add Branch Admin"} condition={"positive"} onClick={handleSubmit}/>
                    </div>
                </form>
            </div>
        </div>
            </div>
        </div>
        </>
    )
}
