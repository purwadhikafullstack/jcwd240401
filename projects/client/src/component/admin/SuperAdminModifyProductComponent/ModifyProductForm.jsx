import React from 'react'
import { Formik, Form, Field } from 'formik';

import InputField from '../../InputField';
import Modal from '../../Modal';
import { modifyProductSchema } from '../../../helpers/validationSchema';
import handleImageError from '../../../helpers/handleImageError';

export default function ModifyProductForm({ onSubmit, preview, imagePreview, allCategory, uOMOptions, productDetails }) {
    return (
        <div className='lg:p-4 grid content-center'>
            <Formik enableReinitialize initialValues={{ name: productDetails.name, description: productDetails.description, category_id: productDetails.category_id, weight: productDetails.weight, unitOfMeasurement: productDetails.unitOfMeasurement, basePrice: productDetails.basePrice, storageInstruction: productDetails.storageInstruction, storagePeriod: productDetails.storagePeriod, file: null, }} validationSchema={modifyProductSchema} onSubmit={onSubmit}>
                {(props) => (
                    <Form className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
                        <div className='lg:p-4'>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="name" className='font-medium'>Name <span className="text-sm font-normal">(max. 50 characters) </span></label>
                                <div className='relative'>
                                    <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                                    {props.errors.name && props.touched.name && <div className="text-reddanger absolute top-12">{props.errors.name}</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="description" className='font-medium'>Description <span className="text-sm font-normal">(max. 500 characters) </span></label>
                                <div className='relative'>
                                    <InputField value={props.values.description} id={"description"} type={"string"} name="description" onChange={props.handleChange} />
                                    {props.errors.description && props.touched.description && <div className="text-reddanger absolute top-12">{props.errors.description}</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="category_id" className='font-medium'>Category</label>
                                <div className='relative'>
                                    <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='category_id'>
                                        <option key="empty" value=''>--choose a category--</option>
                                        {allCategory.map((category) => (<option key={category.value} value={category.value}>{category.label}</option>))}
                                    </Field>
                                    {props.errors.category_id && props.touched.category_id && <div className="text-reddanger absolute top-12">{props.errors.category_id}</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="weight" className='font-medium'>Weight <span className="text-sm font-normal">(in gr/ml) </span></label>
                                <div className='relative'>
                                    <InputField value={props.values.weight} id={"weight"} type={"number"} name="weight" onChange={props.handleChange} />
                                    {props.errors.weight && props.touched.weight && <div className="text-reddanger absolute top-12">{props.errors.weight}</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="unitOfMeasurement" className='font-medium'>Unit Of Measurement </label>
                                <div className='relative'>
                                    <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='unitOfMeasurement'>
                                        <option key="empty" value=''>--choose one below--</option>
                                        {uOMOptions.map((uOM) => (<option key={uOM.value} value={uOM.value}>{uOM.label}</option>))}
                                    </Field>
                                    {props.errors.unitOfMeasurement && props.touched.unitOfMeasurement && <div className="text-reddanger absolute top-12">{props.errors.unitOfMeasurement}</div>}
                                </div>
                            </div>
                        </div>
                        <div className='lg:p-4'>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="basePrice" className='font-medium'>Base Price <span className="text-sm font-normal">(in rupiah) </span></label>
                                <div className='relative'>
                                    <InputField value={props.values.basePrice} id={"basePrice"} type={"number"} name="basePrice" onChange={props.handleChange} />
                                    {props.errors.basePrice && props.touched.basePrice && <div className="text-reddanger absolute top-12">{props.errors.basePrice}</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="storageInstruction" className='font-medium'>Storage Instruction <span className="text-sm font-normal">(max. 255 characters) </span></label>
                                <div className='relative'>
                                    <InputField value={props.values.storageInstruction} id={"storageInstruction"} type={"string"} name="storageInstruction" onChange={props.handleChange} />
                                    {props.errors.storageInstruction && props.touched.storageInstruction && <div className="text-reddanger absolute top-12">{props.errors.storageInstruction}</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                <label htmlFor="storagePeriod" className='font-medium'>Storage Period <span className="text-sm font-normal">(max. 255 characters) </span></label>
                                <div className='relative'>
                                    <InputField value={props.values.storagePeriod} id={"storagePeriod"} type={"string"} name="storagePeriod" onChange={props.handleChange} />
                                    {props.errors.storagePeriod && props.touched.storagePeriod && <div className="text-reddanger absolute top-12">{props.errors.storagePeriod}</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 py-4 mb-14 lg:mb-24">
                                <label htmlFor="file" className='font-medium'>Image <span className="text-sm font-normal">(.jpg, .jpeg, .png) max. 1MB </span></label>
                                <div>
                                    {(imagePreview) ? (
                                        <img id="frame" className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={imagePreview} onError={handleImageError} alt="/" />
                                    ) : (
                                        <img className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={productDetails.file} onError={handleImageError} alt="/" />
                                    )}
                                </div>
                                <div className='relative'>
                                    <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} />
                                    {props.errors.file && props.touched.file && <div className="text-reddanger absolute top-12">{props.errors.file}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="my-8 lg:col-span-2 lg:px-20">
                            <Modal buttonTypeToggle={"button"} isDisabled={!props.dirty} modalTitle={"Modify Product"} toggleName={"Modify Product"} content={"Editing this product will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
