import axios from "axios";

export default function getAllDiscountTypes() {
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
