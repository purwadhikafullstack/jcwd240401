import axios from "axios";

export function getProfileByToken(token) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function modifyImageProfile(token, formData) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/users/profile/image-profile`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export function modifyCredential(token, data) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/users/profile/credential`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getAddressByToken(token) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAddressByName(token, name) {
  return axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/users/addresses/${encodeURIComponent(
      name
    )}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function removeOrSetMainAddress(token, action, id) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/users/addresses/${id}/${action}`,
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function createAddress(token, values) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/users/address`,
    values,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function modifyAddress(token, id, data) {
  return axios.patch(
    `${process.env.REACT_APP_API_BASE_URL}/users/addresses/${id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function getMainAddress(token) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/main-address`, {
    headers: {
        "Authorization": `Bearer ${token}`
    }
  })
}
