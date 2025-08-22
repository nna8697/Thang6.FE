import { get, post, put, del } from "../utils/request";

export const getAllInvoices = async () => {
    const result = await get("api/invoices");
    return result;
}

export const getInvoices = async (params) => {
    debugger
    const result = await post("api/invoices/getInvoices", params);
    return result;
}

export const deleteInvoice = async (id, reason) => {
    return await del(`api/invoices/${id}`, {
        reason,
        deletedReason: reason
    });
};

export const createInvoice = async (data) => {
    return await post("api/invoices", data);
};

export const updateInvoice = async (id, data) => {
    return await put(`api/invoices/${id}`, data);
};