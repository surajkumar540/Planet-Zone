import axios from "./axios"

const headerData =
{
    headers: {
        'Content-Type': 'application/json'
    }
}



/////////////////============Contact us api

export const contactUsApi = async (obj) => {
    const response = await axios.post(`/api/contactUs`,obj, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const getContactUs = async () => {
    const response = await axios.get(`/api/contactUs`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const deleteMail = async (emailId) => {
    const response = await axios.delete(`/api/contactUs/${emailId}`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}

export const deleteAllMails = async () => {
    const response = await axios.delete(`/api/contact/deleteAll`, headerData);
    if (!response.statusText === "OK") {
        throw new Error("Something is wrong.");
    }
    return response.data
}


