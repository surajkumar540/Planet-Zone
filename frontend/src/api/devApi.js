import axios from "axios";

const UserApiVersion = "api/signup";
const OtpApiVersion = "api/verify";

const headerData =
{
    headers: {
        'Content-Type': 'application/json'
    }
}

//////-------------------------------///////////
/////user verification already exists or not api call in new  version////
//////-------------------------------///////////

export const getAllProducts = async () => {
    const response = await axios.get(`/products`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}
