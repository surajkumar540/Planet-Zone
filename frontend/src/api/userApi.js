import axios from "./axios"

const headerData =
{
    headers: {
        'Content-Type': 'application/json'
    }
}

//////-------------------------------///////////
///////-------Authentication -------------////
//////-------------------------------///////////

export const signup = async (data) => {
    const response = await axios.post(`/api/signup`, data, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const login = async (data) => {
    const response = await axios.post(`/api/login`, data, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const otpVerify = async (data) => {
    const response = await axios.post(`/api/otpVerify`, data, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const forgetOtp = async (data) => {
    const response = await axios.post(`/api/forgetOtp`, data, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const changePassword = async (data) => {
    const response = await axios.post(`/api/changePassword`, data, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const tokenVerify = async (data) => {
    const response = await axios.post(`/api/tokenVerification`,data,headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}




//////-------------------------------///////////
/////============User Profile ==========////
//////-------------------------------///////////


export const getProfile = async () => {
    const response = await axios.get(`/api/profile`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const setProfile = async (data) => {
    const response = await axios.post(`/api/profile`, data, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}
