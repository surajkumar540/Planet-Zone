import axios from "axios";

const UserApiVersion = "/api/signup";

const headerData =
{
    headers: {
        'Content-Type': 'application/json'
    }
}

//////-------------------------------///////////
/////get All products ////
//////-------------------------------///////////

export const getAllProducts = async () => {
    const response = await axios.get(`/api/products`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

//////-------------------------------///////////
/////user verification already exists or not api call in new  version////
//////-------------------------------///////////

export const fetchSingleProductApi = async (pid) => {
    const response = await axios.get(`/api/product/${pid}`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}
