import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Space,
    Input,
    Modal,
    Form,
    message,
    Popconfirm,
    Select,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    getUsers,
    updateUser,
    softDeleteUser,
    register,
} from "../../services/usersService";

const { Search } = Input;
const { Option } = Select;

function Account() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
            setFilteredUsers(data.filter((u) => u.status !== 0));
        } catch (err) {
            message.error("Lỗi khi tải danh sách người dùng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSearch = (value) => {
        const keyword = value.toLowerCase();
        const results = users.filter(
            (u) =>
                u.fullname?.toLowerCase().includes(keyword) ||
                u.username?.toLowerCase().includes(keyword)
        );
        setFilteredUsers(results);
    };

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setOpenModal(true);
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue(record);
        setOpenModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await softDeleteUser(id);
            message.success("Đã xoá tài khoản!");
            fetchUsers();
        } catch (err) {
            message.error("Lỗi khi xoá!");
        }
    };

    const handleStatusToggle = async (record) => {
        const newStatus = record.status === 1 ? 2 : 1;
        try {
            await updateUser(record.id, { status: newStatus });
            message.success("Cập nhật trạng thái thành công!");
            fetchUsers();
        } catch (err) {
            message.error("Lỗi khi cập nhật trạng thái!");
        }
    };

    const onFinish = async (values) => {
        const payload = {
            ...values,
            status: editingUser ? editingUser.status : 2,
        };

        try {
            if (editingUser) {
                await updateUser(editingUser.id, payload);
                message.success("Đã cập nhật!");
            } else {
                await register(payload);
                message.success("Đã thêm!");
            }

            setOpenModal(false);
            fetchUsers();
        } catch (err) {
            message.error("Lỗi khi lưu!");
        }
    };

    const roleName = (role) => {
        switch (role) {
            case 1:
                return "Nhân viên";
            case 2:
                return "Admin";
            default:
                return "Khác";
        }
    };

    const columns = [
        { title: "Họ tên", dataIndex: "fullname", key: "fullname" },
        { title: "Tài khoản", dataIndex: "username", key: "username" },
        { title: "SĐT", dataIndex: "tel", key: "tel" },
        {
            title: "Lương",
            dataIndex: "salary",
            render: (text) => text?.toLocaleString("vi-VN") + "₫",
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            render: (role) => roleName(role),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) =>
                status === 1
                    ? "Đang hoạt động"
                    : status === 2
                        ? "Chưa kích hoạt"
                        : "Đã xoá",
        },
        {
            title: "Hành động",
            render: (text, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="Xoá tài khoản?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                    <Button
                        type="dashed"
                        onClick={() => handleStatusToggle(record)}
                        size="small"
                    >
                        {record.status === 1 ? "Ngừng kích hoạt" : "Kích hoạt"}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm theo tên hoặc tài khoản"
                    onSearch={onSearch}
                    allowClear
                />
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm mới
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
                    Làm mới
                </Button>
            </Space>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={filteredUsers}
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title={editingUser ? "Cập nhật tài khoản" : "Thêm mới tài khoản"}
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Form.Item
                        name="fullname"
                        label="Họ tên"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[{ required: true }]}
                    >
                        <Input disabled={!!editingUser} />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item name="tel" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="salary" label="Lương">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value={1}>Nhân viên</Option>
                            <Option value={2}>Admin</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Account;
