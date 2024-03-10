import axios from "./axios"

const headerData =
{
    headers: {
        'Content-Type': 'application/json'
    }
}



//-------------------- get shipping address

export const getShipping = async () => {
    const response = await axios.get(`/api/shipping`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const shippingAdd = async (data) => {
    const response = await axios.post(`/api/shipping`,data, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}
