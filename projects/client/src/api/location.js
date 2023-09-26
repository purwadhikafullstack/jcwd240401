import axios from 'axios'

export function getAllProvinces(){
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/all-province`)
}

export function getAllCities(province){
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/all-city?province=${province}`)
}

export function convertCoordinateToPlacename(latitude, longitude) {
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/location?latitude=${latitude}&longitude=${longitude}`)
}