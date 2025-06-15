import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { createTool, deleteTool, getAllTools, updateTool } from '../../services/toolService';

const { Option } = Select;

const ToolManager = () => {
    const [tools, setTools] = useState([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    const fetchTools = async () => {
        try {
            const data = await getAllTools();
            setTools(data);
        } catch (err) {
            console.error(err);
            message.error('Lỗi tải dữ liệu dụng cụ');
        }
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const handleOk = async () => {
        const values = await form.validateFields();
        try {
            if (editingId) {
                const res = await updateTool(editingId, values);
                if (!res) throw new Error('Update failed');
            }
            else {
                const res = await createTool(values);
                if (!res) throw new Error('Create failed');
            }

            message.success(editingId ? 'Đã cập nhật dụng cụ' : 'Đã thêm dụng cụ');
            form.resetFields();
            setVisible(false);
            setEditingId(null);
            fetchTools();
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
            await deleteTool(id);
            message.success('Đã xoá dụng cụ');
            fetchTools();
        } catch (err) {
            message.error('Lỗi xoá dụng cụ');
        }
    };

    const columns = [
        { title: 'Tên dụng cụ', dataIndex: 'name' },
        { title: 'Loại', dataIndex: 'category' },
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
            <Button type="primary" onClick={() => { setVisible(true); form.resetFields(); setEditingId(null); }}>
                Thêm dụng cụ
            </Button>
            <Table dataSource={tools} columns={columns} rowKey="id" style={{ marginTop: 16 }} />
            <Modal
                open={visible}
                title={editingId ? 'Sửa dụng cụ' : 'Thêm dụng cụ'}
                onOk={handleOk}
                onCancel={() => setVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên dụng cụ" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="category" label="Loại dụng cụ" rules={[{ required: true }]}>
                        <Select>
                            <Option value="pha chế">Pha chế</Option>
                            <Option value="khác">Khác</Option>
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

export default ToolManager;
