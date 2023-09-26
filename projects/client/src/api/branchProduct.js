import axios from "axios";

export function removeBranchProduct(token, branchProductId) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${branchProductId}/remove`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function getBranchProducts(
  token,
  paramPage,
  paramSearch,
  paramCategory,
  paramStatus,
  paramSortName
) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products?page=${paramPage}&search=${paramSearch}&filterCategory=${paramCategory}&filterStatus=${paramStatus}&sortName=${paramSortName}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getBranchProductById(token, branchProductId) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${branchProductId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function createBranchProduct(token, values) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function modifyBranchProductStock(
  token,
  branchProductId,
  action,
  quantity
) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${branchProductId}/stock/${action}`,
    { quantity: quantity },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function modifyBranchProductDetails(
  token,
  branchProductId,
  values
) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${branchProductId}/modify`,
    values,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}


export function oneBranchProductForUser(branchId, name, weight, unitOfMeasurement) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branch-products/${branchId}/${encodeURIComponent(name)}/${weight}/${unitOfMeasurement}`);
}