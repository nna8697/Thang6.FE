import { get, post, put, del } from "../utils/request";

export const getAllWarehouse = async () => {
    const result = await get("api/warehouse");
    return result;
}

export const deleteWarehouse = async (id, reason) => {
    return await del(`api/warehouse/${id}`, {
        reason,
        deletedReason: reason
    });
};

export const createWarehouse = async (data) => {
    return await post("api/warehouse", data);
};

export const updateWarehouse = async (id, data) => {
    return await put(`api/warehouse/${id}`, data);
};