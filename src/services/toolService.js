import { get, post, put, del } from "../utils/request";

export const getAllTools = async () => {
    const result = await get("api/tools");
    return result;
}

export const deleteTool = async (id, reason) => {
    return await del(`api/tools/${id}`, {
        reason,
        deletedReason: reason
    });
};

export const createTool = async (data) => {
    return await post("api/tools", data);
};

export const updateTool = async (id, data) => {
    return await put(`api/tools/${id}`, data);
};

export const updateToolQuantity = async (id, data) => {
    return await post(`api/tools/update-quantity`, data);
};