import React from 'react';
import { Formik, Form, Field } from 'formik';

import InputField from '../../InputField';
import Modal from '../../Modal';
import { createProductSchema } from '../../../helpers/validationSchema';
import handleImageError from '../../../helpers/handleImageError';

export default function CreateProductForm({ onSubmit, preview, imagePreview, allCategory, uOMOptions, fileInputRef }) {
    return (
        <Formik initialValues={{ name: "", description: "", category_id: "", weight: "", unitOfMeasurement: "", basePrice: "", storageInstruction: "", storagePeriod: "", file: null, }} validationSchema={createProductSchema} onSubmit={onSubmit}>
            {(props) => (
                <Form>
                    <div className="text-xs text-reddanger">* required</div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="name" className="font-medium">Name <span className="text-sm font-normal">(max. 50 characters) </span><span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                            {props.errors.name && props.touched.name && <div className="text-sm text-reddanger absolute top-12">{props.errors.name}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="description" className="font-medium">Description <span className="text-sm font-normal">(max. 255 characters) </span><span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <InputField value={props.values.description} id={"description"} type={"string"} name="description" onChange={props.handleChange} />
                            {props.errors.description && props.touched.description && <div className="text-sm text-reddanger absolute top-12">{props.errors.description}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="category_id" className="font-medium">Category <span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0 overflow-y-auto' name='category_id'>
                                <option key="empty" value=''>--choose a category--</option>
                                {allCategory.map((category) => (<option key={category.value} value={category.value}>{category.label}</option>))}
                            </Field>
                            {props.errors.category_id && props.touched.category_id && <div className="text-sm text-reddanger absolute top-12">{props.errors.category_id}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="weight" className="font-medium">Weight <span className="text-sm font-normal">(in gr/ml) </span><span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <InputField value={props.values.weight} id={"weight"} type={"number"} name="weight" onChange={props.handleChange} />
                            {props.errors.weight && props.touched.weight && <div className="text-sm text-reddanger absolute top-12">{props.errors.weight}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="unitOfMeasurement" className="font-medium">Unit Of Measurement <span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='unitOfMeasurement'>
                                <option key="empty" value=''>--choose one UoM--</option>
                                {uOMOptions.map((uOM) => (<option key={uOM.value} value={uOM.value}>{uOM.label}</option>))}
                            </Field>
                            {props.errors.unitOfMeasurement && props.touched.unitOfMeasurement && <div className="text-sm text-reddanger absolute top-12">{props.errors.unitOfMeasurement}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="basePrice" className="font-medium">Base Price <span className="text-sm font-normal">(in rupiah) </span><span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <InputField value={props.values.basePrice} id={"basePrice"} type={"number"} name="basePrice" onChange={props.handleChange} />
                            {props.errors.basePrice && props.touched.basePrice && <div className="text-sm text-reddanger absolute top-12">{props.errors.basePrice}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="storageInstruction" className="font-medium">Storage Instruction <span className="text-sm font-normal">(max. 255 characters) </span><span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <InputField value={props.values.storageInstruction} id={"storageInstruction"} type={"string"} name="storageInstruction" onChange={props.handleChange} />
                            {props.errors.storageInstruction && props.touched.storageInstruction && <div className="text-sm text-reddanger absolute top-12">{props.errors.storageInstruction}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                        <label htmlFor="storagePeriod" className="font-medium">Storage Period <span className="text-sm font-normal">(max. 255 characters) </span><span className="text-reddanger">*</span></label>
                        <div className='relative'>
                            <InputField value={props.values.storagePeriod} id={"storagePeriod"} type={"string"} name="storagePeriod" onChange={props.handleChange} />
                            {props.errors.storagePeriod && props.touched.storagePeriod && <div className="text-sm text-reddanger absolute top-12">{props.errors.storagePeriod}</div>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 mb-24">
                        <label htmlFor="file" className="font-medium">Image <span className="text-sm font-normal">(.jpg, .jpeg, .png) max. 1MB </span><span className="text-reddanger">*</span></label>
                        <div>
                            {(imagePreview) ? (
                                <img id="frame" className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={imagePreview} onError={handleImageError} alt="/" />
                            ) : (
                                <img className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={""} onError={handleImageError} alt="/" />
                            )}
                        </div>
                        <div className='relative'>
                            <input className='border border-gray-300 text-sm w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} required ref={fileInputRef} />
                            {props.errors.file && props.touched.file && <div className="text-sm text-reddanger absolute top-12">{props.errors.file}</div>}
                        </div>
                    </div>
                    <div className="mt-8">
                        <Modal buttonTypeToggle={"button"} isDisabled={!props.dirty || !props.isValid} modalTitle={"Create New Product"} toggleName={"Create Product"} content={"By creating this product, you're adding content for future accessibility. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                    </div>
                </Form>
            )}
        </Formik>
    )
}
