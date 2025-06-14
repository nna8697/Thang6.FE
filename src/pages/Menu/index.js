import React, { useState, useEffect } from "react";
import {
    Table, Select, Button, Modal, Form, Input, message, Popconfirm, Space, Upload
} from "antd";
import {
    PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, UploadOutlined
} from "@ant-design/icons";
import { getAllCategories } from "../../services/categoriesService";
import { getAllProducts, updateProduct, createProduct, deleteProduct } from "../../services/productsService";

const { Option } = Select;

const Menu = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [searchText, setSearchText] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            // const res = await fetch("http://localhost:2025/api/categories");
            // const json = await res.json();
            
            const res = await getAllCategories();
            setCategories(res);
        } catch (err) {
            message.error("Lỗi khi tải danh mục!");
        }
    };

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            // const res = await fetch("http://localhost:2025/api/products");
            // const res = await getAllProducts();
            const json = await getAllProducts();
            const formatted = json.map((item) => ({
                key: item.id.toString(),
                name: item.name,
                category: categories.find(cat => cat.id === item.categoryId)?.name || "Khác",
                price: Number(item.price).toLocaleString("vi-VN") + "đ",
                ...item,
            }));
            setData(formatted);
        } catch (err) {
            message.error("Lỗi khi tải danh sách món!");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            fetchProducts();
        }
    }, [categories]);

    const filteredData = data.filter((item) => {
        const matchCategory =
            selectedCategory === "Tất cả" || item.category === selectedCategory;
        const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        return matchCategory && matchSearch;
    });

    const handleCreateOrUpdate = async (values) => {
        
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('categoryId', categories.find(cat => cat.name === values.category)?.id);
        formData.append('price', values.price.replace(/\D/g, ""));
        formData.append('status', values.status);

        if (values.image && values.image.length > 0) {
            formData.append('image', values.image[0].originFileObj);
        }

        // var obj = {
        //     name: values.name,
        //     categoryId: categories.find(cat => cat.name === values.category)?.id,
        //     price: values.price.replace(/\D/g, ""),
        //     status: values.status,
        //     image: values.image && values.image.length > 0 ? values.image[0].name : null,
        // };

        // const obj = values;
        // if (values.image && values.image[0].name) {
        //     obj.image = values.image[0].name;
        // }
        try {
            if (isEdit && editingItem) {
                // await fetch(`http://localhost:2025/api/products/${editingItem.id}`, {
                //     method: "PUT",
                //     body: formData,
                // });
                await updateProduct(editingItem.id, formData);
                message.success("Cập nhật món thành công!");
            } else {
                // 
                // await fetch("http://localhost:2025/api/products", {
                //     method: "POST",
                //     body: formData,
                // });

                await createProduct(formData);

                message.success("Đã thêm món mới!");
            }
            fetchProducts();
        } catch (err) {
            console.error(err);
            message.error("Thao tác thất bại!");
        }

        setIsModalVisible(false);
        setIsEdit(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleEdit = (item) => {
        setIsEdit(true);
        setEditingItem(item);

        form.setFieldsValue({
            name: item.name,
            category: item.category,
            price: item.price.replace("đ", ""),
            status: item.status,
            image: [
                {
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: "http://localhost:2025" + item.imgLink,
                },
            ],
        });

        setIsModalVisible(true);
    };

    const handleDelete = async (key) => {
        try {
            // await fetch(`http://localhost:2025/api/products/${key}`, {
            //     method: "DELETE",
            // });
            await deleteProduct(key);
            message.success("Đã xoá món!");
            fetchProducts();
        } catch (err) {
            message.error("Xoá món thất bại!");
        }
    };

    const columns = [
        {
            title: "Ảnh",
            dataIndex: "imgLink",
            key: "imgLink",
            render: (imgLink) => (
                <img
                    src={imgLink ? "http://localhost:2025" + imgLink : "https://ongbi.vn/wp-content/uploads/2022/09/CA-PHE-MUOI.jpg"}
                    alt="Hình ảnh món"
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                />
            ),
        },
        {
            title: "Tên món",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (price) => `${Number(price).toLocaleString()} đ`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <span style={{ color: status === 1 ? "green" : "red" }}>
                    {status === 1 ? "Đang bán" : "Ngừng bán"}
                </span>
            ),
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
                        title="Bạn có chắc chắn xoá món này?"
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
            <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Select
                    defaultValue="Tất cả"
                    onChange={setSelectedCategory}
                    style={{ width: 200 }}
                >
                    <Option value="Tất cả">Tất cả</Option>
                    {categories.map((cat) => (
                        <Option key={cat.id} value={cat.name}>
                            {cat.name}
                        </Option>
                    ))}
                </Select>

                <Input
                    placeholder="Tìm kiếm món..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                />

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        form.resetFields();
                        setIsEdit(false);
                        setIsModalVisible(true);
                    }}
                >
                    Thêm món
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title={isEdit ? "Cập nhật món" : "Thêm món mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => {
                    form.validateFields().then(handleCreateOrUpdate).catch(() => { });
                }}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        name="name"
                        label="Tên món"
                        rules={[{ required: true, message: "Vui lòng nhập tên món" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                        <Select>
                            {categories.map((cat) => (
                                <Option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Giá (VNĐ)"
                        rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select>
                            <Option value={1}>Kích hoạt</Option>
                            <Option value={0}>Ẩn</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="image"
                        label="Hình ảnh"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e && e.fileList}
                        rules={[{ required: true, message: 'Vui lòng chọn hình ảnh!' }]}
                    >
                        <Upload
                            name="image"
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1}
                            accept="image/*"
                            rules={isEdit ? [] : [{ required: true, message: 'Vui lòng chọn hình ảnh!' }]}
                            itemRender={(originNode, file) => (
                                <div style={{ marginBottom: 8 }}>
                                    <img
                                        src={file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url}
                                        alt={file.name}
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                        >
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
};

export default Menu;
