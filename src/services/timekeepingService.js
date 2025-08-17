import { get, post, put, del } from "../utils/request";

export const getTimekeepingByMonth = async (month, year) => {
    const result = await get(`api/timekeeping?month=${month}&year=${year}`);
    return result;
}

export const createTimekeeping = async (data) => {

    return await post("api/timekeeping", data);
};
