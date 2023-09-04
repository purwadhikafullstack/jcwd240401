import React, { useState } from 'react';
import Button from './Button';
import { Formik, Form } from 'formik';
import * as yup from 'yup';

export default function ModalImageProfile({ onSubmit }) {
    const [openModal, setOpenModal] = useState(false);

    const handleOpenModal = (e) => {
        e.preventDefault();
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const MAX_FILE_SIZE = 1024000;

    const validFileExtensions = { image: ['jpg', 'png', 'jpeg'] };

    function isValidFileType(fileName, fileType) {
        return (
            fileName && validFileExtensions[fileType].indexOf(fileName.split('.').pop()) > -1
        );
    }

    const validationSchema = yup.object().shape({
        file: yup
            .mixed()
            .required('File is required')
            .test('is-valid-type', 'Not a valid image type', (value) =>
                isValidFileType(value && value.name.toLowerCase(), 'image')
            )
            .test('is-valid-size', 'Max allowed size is 100KB', (value) =>
                value && value.size <= MAX_FILE_SIZE
            ),
    });

    return (
        <>
            <Button condition="editImgProfile" onClick={handleOpenModal} buttonType="button" />
            {openModal && (
                <div
                    id="staticModal"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-opacity-50 bg-gray-900 z-50"
                >
                    <div className="relative w-full max-w-2xl max-h-full mx-3">
                        {/* Modal content */}
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/* Modal header */}
                            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Modify Profile Picture
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-hide="staticModal"
                                    onClick={handleCloseModal}
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/* Modal body */}
                            <div className="p-6 space-y-6">
                                <Formik initialValues={{ file: null }} validationSchema={validationSchema} onSubmit={async (values, { setSubmitting, resetForm, setStatus, setFieldValue }) => {
                                    await onSubmit(values, { setSubmitting, resetForm, setStatus, setFieldValue });
                                    handleCloseModal();
                                }}>
                                    {(props) => (
                                        <Form>
                                            <div className="text-base leading-relaxed text-gray-500 dark:text-gray-400 text-center mx-auto px-4">
                                                <div> By clicking 'Save', your current profile picture will be permanently replaced. Are you sure? </div>
                                                <div className='mb-2 relative'>
                                                    <input
                                                        type="file"
                                                        id="file"
                                                        name="file"
                                                        onChange={(e) => {
                                                            props.setFieldValue('file', e.currentTarget.files[0]);
                                                        }}
                                                        className='py-2'
                                                        required />
                                                    {props.errors.file && props.touched.file && <div className="text-sm text-reddanger absolute top-12">{props.errors.file}</div>}
                                                </div>
                                            </div>
                                            <div className='flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600'>
                                                <Button data-modal-hide="staticModal" label="Cancel" buttonType="button" condition="negative" onClick={handleCloseModal} />
                                                <Button
                                                    isDisabled={!props.dirty || !props.isValid}
                                                    type={"submit"}
                                                    label="Save"
                                                    onClick={props.handleSubmit}
                                                    condition="positive"
                                                />
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}