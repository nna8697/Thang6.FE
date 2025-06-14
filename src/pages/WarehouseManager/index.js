import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message, Tag, Card, Row, Col, Statistic } from 'antd';
import dayjs from 'dayjs';
import { createWarehouse, deleteWarehouse, getAllWarehouse, updateWarehouse } from '../../services/warehouseService';
import { getAllIngredient, updateIngredientQuantity } from '../../services/IngredientService';
import { getAllTools, updateToolQuantity } from '../../services/toolService';

const WarehouseManager = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [tools, setTools] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedItemInfo, setSelectedItemInfo] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
    const [totalValue, setTotalValue] = useState(0);

    // Format price without decimals (2.000.000 instead of 2,000,000.00)
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Format date as DD/MM/YYYY
    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    const fetchData = async () => {
        try {
            // const [logsRes, ingredientsRes, toolsRes] = await Promise.all([
            //     fetch('http://localhost:2025/api/warehouse'),
            //     fetch('http://localhost:2025/api/ingredients'),
            //     fetch('http://localhost:2025/api/tools')
            // ]);

            // const [logsRes, ingredientsRes, toolsRes] = await Promise.all([
            //     getAllWarehouse(),
            //     getAllIngredient(),
            //     getAllTools(),
            // ])

            const [logsData, ingredientsData, toolsData] = await Promise.all([
                getAllWarehouse(),
                getAllIngredient(),
                getAllTools(),
            ]);

            setLogs(logsData);
            setIngredients(ingredientsData);
            setTools(toolsData);
            filterLogsByMonth(logsData, selectedMonth);
        } catch (err) {
            console.error('Error fetching data:', err);
            message.error('Failed to load data');
        }
    };

    const filterLogsByMonth = (data, month) => {
        const filtered = data.filter(log => log.date.startsWith(month));
        setFilteredLogs(filtered);

        // Calculate total value (sum of prices only)
        const total = filtered.reduce((sum, log) => sum + parseFloat(log.price), 0);
        setTotalValue(total);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterLogsByMonth(logs, selectedMonth);
    }, [selectedMonth, logs]);

    const updateStock = async ({ type, name, quantity, oldQuantity = 0 }) => {
        try {
            // const table = type === 'ingredient' ? 'ingredients' : 'tools';
            const diff = quantity - oldQuantity;

            // await fetch(`http://localhost:2025/api/${table}/update-quantity`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ name, quantity: diff }),
            // });

            type === 'ingredient' ? await updateIngredientQuantity(name, { quantity: diff }) : await updateToolQuantity(name, { quantity: diff });

        } catch (err) {
            console.error('Cập nhật tồn kho thất bại', err);
            message.error('Cập nhật tồn kho thất bại');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = { ...values, date: values.date.format('YYYY-MM-DD') };

            if (editingId) {
                // await fetch(`http://localhost:2025/api/warehouse/${editingId}`, {
                //     method: 'PUT',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(payload),
                // });

                await updateWarehouse(editingId, payload);

                await updateStock({
                    type: payload.type,
                    name: payload.name,
                    quantity: payload.quantity,
                    oldQuantity: editingRecord?.quantity || 0,
                });
                message.success('Đã cập nhật phiếu và tồn kho');
            } else {
                // await fetch('http://localhost:2025/api/warehouse', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(payload),
                // });

                await createWarehouse(payload);

                await updateStock({
                    type: payload.type,
                    name: payload.name,
                    quantity: payload.quantity,
                });
                message.success('Đã thêm phiếu và cập nhật tồn kho');
            }

            form.resetFields();
            setVisible(false);
            setEditingId(null);
            setEditingRecord(null);
            setSelectedItemInfo(null);
            fetchData();
        } catch (err) {
            message.error('Lỗi thao tác');
        }
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        form.setFieldsValue({ name: undefined });
        setSelectedItemInfo(null);
    };

    const handleNameChange = (value) => {
        if (selectedType === 'ingredient') {
            const selectedIngredient = ingredients.find(i => i.name === value);
            setSelectedItemInfo({
                label: 'Đơn vị tính',
                value: selectedIngredient?.unit || 'N/A'
            });
        } else {
            const selectedTool = tools.find(t => t.name === value);
            setSelectedItemInfo({
                label: 'Loại dụng cụ',
                value: selectedTool?.category || 'N/A'
            });
        }
    };

    const handleMonthChange = (date) => {
        const month = date ? date.format('YYYY-MM') : dayjs().format('YYYY-MM');
        setSelectedMonth(month);
    };

    const handleEdit = (record) => {
        setVisible(true);
        form.setFieldsValue({ ...record, date: dayjs(record.date) });
        setEditingId(record.id);
        setEditingRecord(record);
        setSelectedType(record.type);

        if (record.type === 'ingredient') {
            const selectedIngredient = ingredients.find(i => i.name === record.name);
            setSelectedItemInfo({
                label: 'Đơn vị tính',
                value: selectedIngredient?.unit || 'N/A'
            });
        } else {
            const selectedTool = tools.find(t => t.name === record.name);
            setSelectedItemInfo({
                label: 'Loại dụng cụ',
                value: selectedTool?.category || 'N/A'
            });
        }
    };

    const handleDelete = async (id, record) => {
        try {
            // await fetch(`http://localhost:2025/api/warehouse/${id}`, { method: 'DELETE' });

            await deleteWarehouse(id);

            await updateStock({
                type: record.type,
                name: record.name,
                quantity: 0,
                oldQuantity: record.quantity,
            });

            message.success('Đã xoá phiếu và cập nhật tồn kho');
            fetchData();
        } catch (err) {
            message.error('Lỗi khi xoá phiếu');
        }
    };

    const columns = [
        { title: 'Loại', dataIndex: 'type', render: (text) => text === 'ingredient' ? 'Nguyên liệu' : 'Dụng cụ' },
        { title: 'Tên', dataIndex: 'name' },
        {
            title: 'Thông tin',
            render: (_, record) => {
                if (record.type === 'ingredient') {
                    const ingredient = ingredients.find(i => i.name === record.name);
                    return ingredient ? `Đơn vị: ${ingredient.unit}` : 'N/A';
                } else {
                    const tool = tools.find(t => t.name === record.name);
                    return tool ? `Loại: ${tool.category}` : 'N/A';
                }
            }
        },
        { title: 'Số lượng nhập', dataIndex: 'quantity' },
        {
            title: 'Giá (VND)',
            dataIndex: 'price',
            render: (price) => formatPrice(price)
        },
        {
            title: 'Ngày nhập',
            dataIndex: 'date',
            render: (date) => formatDate(date)
        },
        {
            title: 'Chức năng',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button danger onClick={() => handleDelete(record.id, record)} style={{ marginLeft: 8 }}>
                        Xoá
                    </Button>
                </>
            ),
        },
    ];

    const nameOptions = selectedType === 'ingredient'
        ? ingredients.map(i => ({ label: i.name, value: i.name }))
        : tools.map(t => ({ label: t.name, value: t.name }));

    return (
        <>
            <Card>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Chọn tháng">
                            <DatePicker
                                picker="month"
                                format="MM/YYYY"
                                value={dayjs(selectedMonth)}
                                onChange={handleMonthChange}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Tổng số phiếu nhập"
                            value={filteredLogs.length}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Tổng giá trị nhập hàng"
                            value={totalValue}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix=""
                            suffix="VND"
                            formatter={(value) => formatPrice(value)}
                        />
                    </Col>
                </Row>
            </Card>

            <Button
                type="primary"
                onClick={() => {
                    setVisible(true);
                    form.resetFields();
                    setEditingId(null);
                    setEditingRecord(null);
                    setSelectedType(null);
                    setSelectedItemInfo(null);
                }}
                style={{ marginTop: 16 }}
            >
                Thêm phiếu
            </Button>

            <Table
                dataSource={filteredLogs}
                columns={columns}
                rowKey="id"
                style={{ marginTop: 16 }}
                footer={() => (
                    <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        Tổng cộng: {formatPrice(totalValue)} VND
                    </div>
                )}
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4}>Tổng cộng</Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                                {formatPrice(totalValue)} VND
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            <Modal
                open={visible}
                title={editingId ? 'Sửa phiếu' : 'Thêm phiếu'}
                onOk={handleOk}
                onCancel={() => {
                    setVisible(false);
                    setSelectedItemInfo(null);
                }}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { label: 'Dụng cụ', value: 'tool' },
                                { label: 'Nguyên liệu', value: 'ingredient' }
                            ]}
                            onChange={handleTypeChange}
                        />
                    </Form.Item>

                    <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={nameOptions}
                            disabled={!selectedType}
                            onChange={handleNameChange}
                            placeholder="Chọn tên"
                        />
                    </Form.Item>

                    {selectedItemInfo && (
                        <Form.Item label={selectedItemInfo.label}>
                            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                                {selectedItemInfo.value}
                            </Tag>
                        </Form.Item>
                    )}

                    <Form.Item name="quantity" label="Số lượng nhập" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="price" label="Giá (VND)" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="date" label="Ngày nhập" rules={[{ required: true }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default WarehouseManager;