import { get, post, put, del } from "../utils/request";

export const getAllCategories = async () => {
    const result = await get("api/categories");
    return Array.isArray(result) ? result : [];
};

export const createCategory = async (data) => {
    return await post("api/categories", data);
};

export const updateCategory = async (id, data) => {
    return await put(`api/categories/${id}`, data);
};

export const deleteCategory = async (id) => {
    return await del(`api/categories/${id}`);
};
