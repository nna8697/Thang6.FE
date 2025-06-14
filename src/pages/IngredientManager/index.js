// IngredientManager.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Select } from 'antd';
import { getAllIngredient, updateIngredient, createIngredient, deleteIngredient } from '../../services/IngredientService';

const IngredientManager = () => {
    const [ingredients, setIngredients] = useState([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    // Danh sách đơn vị tính cố định
    const fixedUnits = ['g', 'kg', 'gói', 'chai', 'hộp'];

    const fetchIngredients = async () => {
        try {
            // const res = await fetch('http://localhost:2025/api/ingredients');
            const data = await getAllIngredient();
            setIngredients(data);
        } catch (err) {
            console.error(err);
            message.error('Lỗi tải dữ liệu nguyên liệu');
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const handleOk = async () => {
        const values = await form.validateFields();
        try {
            // const url = editingId
            //     ? `http://localhost:2025/api/ingredients/${editingId}`
            //     : 'http://localhost:2025/api/ingredients';
            // const method = editingId ? 'PUT' : 'POST';
            // const res = await fetch(url, {
            //     method,
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(values),
            // });
            // if (!res.ok) throw new Error('Save failed');
            if (editingId) {
                const res = await updateIngredient(editingId, values);
                if (!res) throw new Error('Update failed');
            }
            else {
                const res = await createIngredient(values);
                if (!res) throw new Error('Create failed');
            }
            debugger
            message.success(editingId ? 'Đã cập nhật nguyên liệu' : 'Đã thêm nguyên liệu');
            form.resetFields();
            setVisible(false);
            setEditingId(null);
            fetchIngredients();
        } catch (err) {
            message.error('Lỗi thao tác');
        }
    };

    const handleEdit = (record) => {
        setVisible(true);
        form.setFieldsValue(record);
        setEditingId(record.id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteIngredient(id);
            message.success('Đã xoá nguyên liệu');
            fetchIngredients();
        } catch (err) {
            message.error('Lỗi xoá nguyên liệu');
        }
    };

    const columns = [
        { title: 'Tên nguyên liệu', dataIndex: 'name' },
        { title: 'Đơn vị tính', dataIndex: 'unit' },
        { title: 'Số lượng', dataIndex: 'quantity' },
        {
            title: 'Chức năng',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button danger onClick={() => handleDelete(record.id)} style={{ marginLeft: 8 }}>
                        Xoá
                    </Button>
                </>
            ),
        },
    ];

    return (
        <>
            <Button
                type="primary"
                onClick={() => {
                    setVisible(true);
                    form.resetFields();
                    setEditingId(null);
                }}
            >
                Thêm nguyên liệu
            </Button>
            <Table dataSource={ingredients} columns={columns} rowKey="id" style={{ marginTop: 16 }} />
            <Modal
                open={visible}
                title={editingId ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
                onOk={handleOk}
                onCancel={() => setVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên nguyên liệu" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}>
                        <Select>
                            {fixedUnits.map((u) => (
                                <Select.Option key={u} value={u}>
                                    {u}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default IngredientManager;
