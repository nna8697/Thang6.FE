import { get, post, put, del } from "../utils/request";

export const getAllProducts = async () => {
    const result = await get("api/products");
    return Array.isArray(result) ? result : [];
};

export const createProduct = async (data) => {
    return await post("api/products", data, true);
};

export const updateProduct = async (id, data) => {
    return await put(`api/products/${id}`, data, true);
};

export const deleteProduct = async (id) => {
    return await del(`api/products/${id}`);
};
