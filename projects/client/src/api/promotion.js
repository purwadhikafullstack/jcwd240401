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

export function getAllDiscount() {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/discounts`);
}

export function getAllVoucher() {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/vouchers`);
}

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
    return response.data.data;
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
