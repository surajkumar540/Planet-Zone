import axios from "./axios"

const headerData =
{
    headers: {
        'Content-Type': 'application/json'
    }
}


export const createOrderApi = async (obj) => {
    const response = await axios.post(`/api/createOrder`,obj, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const getAllOrders = async () => {
    const response = await axios.get(`/api/orders`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


export const getSingleOrder = async (orderId) => {
    const response = await axios.get(`/api/order/${orderId}`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

