import axios from 'axios'

export function createBranch(token, values) {
    return axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/admins/register`, values, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
}

export function login(values){
    return axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`, values, {
          headers: { "Content-Type": "application/json" },
        });
}

export function registerUser(values) {
    return axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/users/register`, values, {
        headers: {"Content-Type" : "application/json"}
    })
}

export function forgotPassword(values) {
    return axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/forgot-password`, values, {
        headers: {"Content-Type" : "application/json"}
    })
}

export function keepLoginAccount(token) {
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/keep-login`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export function checkUserVerification(verificationToken) {
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/users/profile?token=${verificationToken}`)
}

export function verifyAccount(verificationToken) {
    return axios.patch(`${process.env.REACT_APP_API_BASE_URL}/auth/users/verify?token=${verificationToken}`)
}

export function resetAccountPassword(resetPasswordToken, values) {
    return axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/users/reset-password?token=${resetPasswordToken}`, values, {
        headers: {"Content-Type" : "application/json"}
    })
}