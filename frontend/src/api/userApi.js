import axios from "./axios"

export const signup = async (data) => {
    const response = await axios.post(`/api/signup`, data);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const login = async (data) => {
    const response = await axios.post(`/api/login`, data);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const otpVerify = async (data) => {
    const response = await axios.post(`/api/otpVerify`, data);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const forgetOtp = async (data) => {
    const response = await axios.post(`/api/forgetOtp`, data);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const changePassword = async (data) => {
    const response = await axios.post(`/api/changePassword`, data);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const tokenVerify = async (data) => {
    const response = await axios.post(`/api/tokenVerification`,data);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}




//////-------------------------------///////////
/////============User Profile ==========////
//////-------------------------------///////////


export const getProfile = async () => {
    const response = await axios.get(`/api/profile`);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const setProfile = async (data) => {
    const response = await axios.post(`/api/profile`, data);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}
