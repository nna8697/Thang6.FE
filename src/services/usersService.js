import { get, post, put } from "../utils/request";

// Đăng nhập
export const login = async (username, password) => {
    const data = { username, password };
    return await post("api/users/login", data);
};

// Lấy danh sách người dùng
export const getUsers = async () => {
    return await get("api/users");
};

// Đăng ký người dùng mới
export const register = async (data) => {
    return await post("api/users/register", data);
};

// Cập nhật người dùng (sửa thông tin, đổi trạng thái,...)
export const updateUser = async (id, data) => {
    return await put(`api/users/${id}`, data);
};

// Đổi trạng thái hoạt động
export const toggleUserStatus = async (id, status) => {
    return await updateUser(id, { status });
};

// Xoá mềm người dùng (status = 0)
export const softDeleteUser = async (id) => {
    return await updateUser(id, { status: 0 });
};
