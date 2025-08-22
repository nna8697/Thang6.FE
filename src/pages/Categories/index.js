import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    message,
    Space,
    Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/categoriesService";

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err) {
            message.error("Lỗi khi tải danh mục!");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateOrUpdate = async (values) => {
        try {
            if (isEdit && editingCategory) {
                await updateCategory(editingCategory.id, { name: values.name });
                message.success("Cập nhật danh mục thành công!");
            } else {
                await createCategory({ name: values.name });
                message.success("Đã thêm danh mục mới!");
            }
            fetchCategories();
        } catch (err) {
            message.error("Thao tác thất bại!");
        }

        setIsModalVisible(false);
        setIsEdit(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const handleEdit = (category) => {
        setIsEdit(true);
        setEditingCategory(category);
        form.setFieldsValue({ name: category.name });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            message.success("Đã xoá danh mục!");
            fetchCategories();
        } catch (err) {
            message.error("Xoá danh mục thất bại!");
        }
    };

    const columns = [
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn xoá danh mục này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xoá"
                        cancelText="Huỷ"
                    >
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        form.resetFields();
                        setIsEdit(false);
                        setIsModalVisible(true);
                    }}
                >
                    Thêm danh mục
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={Array.isArray(categories)
                    ? categories.map((cat) => ({ ...cat, key: cat.id }))
                    : []}
                pagination={{ pageSize: 15 }}
            />

            <Modal
                title={isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => {
                    form.validateFields()
                        .then(handleCreateOrUpdate)
                        .catch(() => { });
                }}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên danh mục",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManager;
