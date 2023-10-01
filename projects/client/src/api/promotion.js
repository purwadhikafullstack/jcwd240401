import axios from "axios";

export function getAllDiscountType() {
  const token = localStorage.getItem("token");
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/discount-types`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export const getAllDiscount = async (
  token,
  paramPage,
  paramSort,
  paramType
) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/admins/discounts?page=${paramPage}&sortDiscount=${paramSort}&filterDiscountType=${paramType}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllVoucher = async (token, paramPage, paramSort, paramType) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/admins/vouchers?page=${paramPage}&sortVoucher=${paramSort}&filterVoucherType=${paramType}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export function getAllVoucherType() {
  const token = localStorage.getItem("token");
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/voucher-types`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export const getDataAllBranchProduct = async (token, currentPage) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products?page=${currentPage}&sortName=ASC`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const handleSubmitDiscount = async (values, token) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/admins/discounts`,
      values,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response;
  } catch (error) {
    throw error;
  }
};

export const handleSubmitVoucher = async (values, token) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/admins/vouchers`,
      values,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export function getUserVouchers(token, subTotal) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/users/vouchers/${subTotal}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
