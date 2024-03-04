import axios from "./axios"

const headerData =
{
    headers: {
        'Content-Type': 'application/json'
    }
}


//-------------------- payment Start

export const paymentInit = async (obj) => {
    const response = await axios.post(`/api/paymentInit`,obj, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const paymentSuccess = async (obj) => {
    const response = await axios.post(`/api/paymentSuccess`,obj, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

