import * as yup from 'yup';

export const fileMaxSize = (maxSize) => {
    return yup.mixed().test('fileSize', 'File size is too large', (value) => {
        return value.size <= maxSize;
    });
};

export const fileMaxSizeNull = (maxSize) => {
    return yup.mixed().test('fileSize', 'File size is too large', (value) => {
        return !value || value.size <= maxSize;
    });
};