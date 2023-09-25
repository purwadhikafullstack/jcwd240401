import axios from "axios";

export function removeProduct(token, productId) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/admins/products/${productId}/remove`,
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function getProducts(
  token,
  paramPage,
  paramSearch,
  paramCategory,
  paramSortName,
  paramSortPrice
) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/products?page=${paramPage}&search=${paramSearch}&filterCategory=${paramCategory}&sortName=${paramSortName}&sortPrice=${paramSortPrice}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function getProductById(token, id) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/products/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getUnaddedProducts(token) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/unadded-products`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function createProduct(token, formData) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/admins/product`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function modifyProduct(token, id, formData) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/admins/products/${id}/modify`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function getPromotedProducts(branchId) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/promoted-products?branchId=${branchId}`)
}

export function productsForUser(latitude, longitude, paramPage, paramSearch, paramCategory, paramSortName, paramSortPrice) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branch-products?latitude=${latitude}&longitude=${longitude}&page=${paramPage}&search=${paramSearch}&filterCategory=${paramCategory}&sortName=${paramSortName}&sortPrice=${paramSortPrice}`)
}
