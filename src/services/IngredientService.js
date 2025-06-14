import { get, post, put, del } from "../utils/request";

// Lấy danh sách nguyên liệu
export const getAllIngredient = async () => {
    const result = await get("api/ingredients");
    return Array.isArray(result) ? result : [];
};

export const createIngredient = async (data) => {
    return await post("api/ingredients", data);
};

export const updateIngredient = async (id, data) => {
    return await put(`api/ingredients/${id}`, data);
};

export const updateIngredientQuantity = async (id, data) => {
    return await post(`api/ingredients/update-quantity`, data);
};

export const deleteIngredient = async (id) => {
    return await del(`api/ingredients/${id}`);
};
