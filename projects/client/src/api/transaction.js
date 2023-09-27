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

export function getShippingCost(
  token,
  origin,
  destination,
  totalWeight,
  courier
) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/users/shipping-cost`,
    {
      origin: origin,
      destination: destination,
      weight: totalWeight,
      courier: courier,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function userCheckout(token, requestBody) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/users/checkout`,
    requestBody,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function getUserOrders(token, id) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/order/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function cancelOrderUser(token, body, id) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/users/orders/${id}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function userPayment(token, formData, id) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/users/payment/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function userConfirmOrder(token, id) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/users/confirm-order/${id}`,
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function addToCart(token, productId, updatedQuantity) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/users/carts/${productId}`,
    { quantity: updatedQuantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function modifyOrderByAdmin(id, token) {
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/order?orderId=${id}`, {
        headers: {'Authorization' : `Bearer ${token}`}
    })
}

export function changeOrderStatus(id, action, token){
    return axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/orders/${id}/${action}`, {}, {
        headers: {"Authorization" : `Bearer ${token}`}
      })
}

export function cancelByAdmin(id, formData, token){
    return axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/orders/${id}`, formData, {
        headers: {'Authorization' : `Bearer ${token}`}
      })
}