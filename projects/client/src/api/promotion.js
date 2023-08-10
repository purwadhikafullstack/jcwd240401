import axios from "axios";

export default function allDiscountTypes() {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/discount-types`
  );
}
