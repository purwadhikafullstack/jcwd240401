import axios from "axios";

export default function getAllDiscountTypes() {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/discount-types`
  );
}

export function getAllDiscount() {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/discounts`);
}

export function getAllVoucher() {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/vouchers`);
}

export function getAllVoucherType() {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/voucher-types`
  );
}
