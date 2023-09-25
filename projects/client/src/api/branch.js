import axios from 'axios'

export function getAllBranches( 
    token,
    paramPage,
    paramSearch,
    paramSort) {
        return axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/branch?page=${paramPage}&search=${paramSearch}&sortOrder=${paramSort}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
}

export function getAllBranchesNoPagination (token) {
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-all-branch`, {
        headers: {'Authorization' : `Bearer ${token}`}
    })
}