import axios from "./axios";

/** Custom T-shirt studio. */

export const getStudioConfig = async () => (await axios.get("/api/designs/config")).data;

/** Saves a design; large because it carries photos and mockups. */
export const saveDesign = async (design) => (await axios.post("/api/designs", design, { timeout: 60000 })).data;

export const getMyDesigns = async () => (await axios.get("/api/designs/mine")).data;

export const getDesign = async (id) => (await axios.get(`/api/designs/${id}`)).data;

export const deleteDesign = async (id) => (await axios.delete(`/api/designs/${id}`)).data;
