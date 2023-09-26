import axios from "axios";

export function getAllOrders(
  token,
  paramPage,
  paramBranchId,
  paramSearch,
  paramStatus,
  paramSort,
  paramStartDate,
  paramEndDate
) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/orders?page=${paramPage}&branchId=${paramBranchId}&search=${paramSearch}&filterStatus=${paramStatus}&sortDate=${paramSort}&startDate=${paramStartDate}&endDate=${paramEndDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function getBranchOrders(
  token,
  paramPage,
  paramSearch,
  paramStatus,
  paramSort,
  paramStartDate,
  paramEndDate
) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/branch-orders?page=${paramPage}&search=${paramSearch}&filterStatus=${paramStatus}&sortDate=${paramSort}&startDate=${paramStartDate}&endDate=${paramEndDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function orderByIdForAdmin(token, orderId) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/order?orderId=${orderId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getUnavailableCart(token) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/users/unavailable-cart`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function handleDeleteCart(token, data) {
  return axios.delete(`${process.env.REACT_APP_API_BASE_URL}/users/carts`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { cartList: data },
  });
}

export function getCart(token) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/carts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
