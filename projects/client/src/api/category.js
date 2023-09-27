import axios from "axios";

export function removeCategory(token, categoryId) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/admins/categories/${categoryId}/remove`,
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getCategories(token, paramPage, paramSearch, paramSortName) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/categories?page=${paramPage}&search=${paramSearch}&sortName=${paramSortName}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getCategoriesNoPagination(token) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-categories`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function getCategoryById(token, id) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/admins/categories/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function createCategory(token, formData) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/admins/category`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function modifyCategory(token, id, formData) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/admins/categories/${id}/modify`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function categoryForUserByBranchId(id) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/branchs/${id}/categories`);
}
