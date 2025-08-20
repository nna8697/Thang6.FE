import React, { useEffect, useState } from 'react';
import { Table, Button, DatePicker, Select, Modal, Input, Tag, Space, message } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './Invoice.scss';
import InvoiceDetailModal from './InvoiceDetailModal';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllInvoices, deleteInvoice } from '../../services/invoicesService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusMap = {
    0: { text: '', color: '' },
    1: { text: 'Đã xoá', color: 'red' },
    2: { text: 'Hoá đơn chỉnh sửa', color: 'orange' },
};

const Invoice = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);
    const [selectedDateFilter, setSelectedDateFilter] = useState('today');
    const [showCustomRange, setShowCustomRange] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');

    const [showEditReasonModal, setShowEditReasonModal] = useState(false);
    const [editReason, setEditReason] = useState('');
    const [editReasonOption, setEditReasonOption] = useState('');
    const [selectedEditOrder, setSelectedEditOrder] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await getAllInvoices();
                const formatted = data.map(item => ({
                    id: item.id,
                    code: `HD${String(item.id).padStart(3, '0')}`,
                    total: parseFloat(item.total),
                    discount: parseFloat(item.discountAmount || 0), //nnanh fix bug không hiển thị giảm giá
                    creator: `${item.fullname}`,
                    createdAt: item.createddate,
                    status: item.status,
                    // Ép orders luôn thành mảng để tránh lỗi .some is not a function
                    orders: Array.isArray(item.orders) ? item.orders : JSON.parse(item.orders),
                    paymentmethod: item.paymentmethod,
                }));
                setOrders(formatted);
            } catch (err) {
                console.error('Fetch invoices failed:', err);
                message.error('Không thể tải hoá đơn');
            }
        };

        fetchInvoices();
    }, []);

    useEffect(() => {
        updateDateRange(selectedDateFilter);
    }, [selectedDateFilter]);

    useEffect(() => {
        filterOrders();
    }, [orders, statusFilter, dateRange]);

    const updateDateRange = (key) => {
        const today = dayjs();
        let start, end;

        switch (key) {
            case 'today':
                start = today.startOf('day');
                end = today.endOf('day');
                setShowCustomRange(false);
                break;
            case 'yesterday':
                start = today.subtract(1, 'day').startOf('day');
                end = today.subtract(1, 'day').endOf('day');
                setShowCustomRange(false);
                break;
            case 'last7':
                start = today.subtract(6, 'day').startOf('day');
                end = today.endOf('day');
                setShowCustomRange(false);
                break;
            case 'last30':
                start = today.subtract(29, 'day').startOf('day');
                end = today.endOf('day');
                setShowCustomRange(false);
                break;
            case 'thisMonth':
                start = today.startOf('month');
                end = today.endOf('month');
                setShowCustomRange(false);
                break;
            case 'lastMonth':
                start = today.subtract(1, 'month').startOf('month');
                end = today.subtract(1, 'month').endOf('month');
                setShowCustomRange(false);
                break;
            case 'custom':
                setShowCustomRange(true);
                return;
            default:
                start = today.startOf('day');
                end = today.endOf('day');
        }

        setDateRange([start, end]);
    };

    const filterOrders = () => {
        const [start, end] = dateRange;

        const filtered = orders.filter(order => {
            const orderDate = dayjs(order.createdAt);
            const matchDate = orderDate.isAfter(start) && orderDate.isBefore(end);
            const matchStatus = statusFilter === null || order.status === statusFilter;
            return matchDate && matchStatus;
        });

        setFilteredOrders(filtered);
    };

    const handleDelete = (order) => {
        setSelectedDeleteOrder(order);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteReason.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Lý do xoá không được để trống',
                text: 'Vui lòng nhập lý do xoá trước khi tiếp tục.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            await deleteInvoice(selectedDeleteOrder.id, deleteReason);
            const updatedOrders = orders.map(o =>
                o.id === selectedDeleteOrder.id
                    ? { ...o, status: 1, deletedReason: deleteReason }
                    : o
            );
            setOrders(updatedOrders);
            setDeleteReason('');
            setShowModal(false);
            message.success('Hoá đơn đã được xoá thành công.');
        } catch (err) {
            console.error('Delete invoice failed:', err);
            message.error('Không thể xoá hoá đơn.');
        }
    };

    const handleEdit = (order) => {
        setSelectedEditOrder(order);
        setShowEditReasonModal(true);
        setEditReason('');
        setEditReasonOption('');
    };

    const confirmEditReason = () => {
        if (!editReasonOption || (editReasonOption === 'other' && !editReason.trim())) {
            Swal.fire({
                icon: 'warning',
                title: 'Vui lòng chọn lý do chỉnh sửa',
                text: 'Bạn cần chọn hoặc nhập lý do trước khi tiếp tục.',
                confirmButtonText: 'OK'
            });
            return;
        }

        const updatedOrder = orders.map(o =>
            o.id === selectedEditOrder.id
                ? {
                    ...o,
                    status: 2,
                    editedReason:
                        editReasonOption === 'other' ? editReason : editReasonOption,
                }
                : o
        );
        setOrders(updatedOrder);
        setShowEditReasonModal(false);
        navigate('/Order', { state: { order: updatedOrder.find(o => o.id === selectedEditOrder.id) } });
    };

    const columns = [
        {
            title: 'STT',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Mã hoá đơn',
            dataIndex: 'code',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            render: val => val.toLocaleString('vi-VN') + '₫',
            align: 'right',
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            render: val => val.toLocaleString('vi-VN') + '₫',
            align: 'right',
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentmethod',
            render: val => val == 0 ? 'Tiền mặt' : 'Chuyển khoản',
        },
        {
            title: 'Người tạo',
            dataIndex: 'creator',
        },
        {
            title: 'Ngày tạo',
            render: record => dayjs(record.createdAt).format('DD/MM/YYYY'),
        },
        {
            title: 'Giờ tạo',
            render: record => dayjs(record.createdAt).format('HH:mm'),
            align: 'right',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: status =>
                statusMap[status].text ? <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag> : '',
        },
        {
            title: 'Thao tác',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => setSelectedOrder(record)}>Xem</Button>
                    {record.status !== 1 && (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)}>Xoá</Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="order-list">
            <div className="order-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <Select
                    style={{ width: 200 }}
                    value={selectedDateFilter}
                    onChange={setSelectedDateFilter}
                >
                    <Option value="today">Hôm nay</Option>
                    <Option value="yesterday">Hôm qua</Option>
                    <Option value="last7">7 ngày trước</Option>
                    <Option value="last30">30 ngày trước</Option>
                    <Option value="thisMonth">Tháng này</Option>
                    <Option value="lastMonth">Tháng trước</Option>
                    <Option value="custom">Tuỳ chỉnh</Option>
                </Select>

                {showCustomRange && (
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                    />
                )}

                <Select
                    placeholder="Trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 200 }}
                    allowClear
                >
                    <Option value={null}>Tất cả</Option>
                    <Option value={1}>Hoá đơn xoá</Option>
                    <Option value={2}>Hoá đơn sửa</Option>
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Lý do xoá hoá đơn"
                open={showModal}
                onOk={confirmDelete}
                onCancel={() => setShowModal(false)}
            >
                <Input.TextArea
                    rows={3}
                    placeholder="Nhập lý do xoá"
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                />
            </Modal>

            <Modal
                title="Lý do chỉnh sửa hoá đơn"
                open={showEditReasonModal}
                onOk={confirmEditReason}
                onCancel={() => setShowEditReasonModal(false)}
            >
                <Select
                    style={{ width: '100%', marginBottom: 10 }}
                    placeholder="Chọn lý do chỉnh sửa"
                    value={editReasonOption}
                    onChange={setEditReasonOption}
                >
                    <Option value="Nhầm phương thức thanh toán">Nhầm phương thức thanh toán</Option>
                    <Option value="Nhầm món">Nhầm món</Option>
                    <Option value="other">Lý do khác</Option>
                </Select>

                {editReasonOption === 'other' && (
                    <Input.TextArea
                        rows={3}
                        placeholder="Nhập lý do khác"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                    />
                )}
            </Modal>

            <InvoiceDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
};

export default Invoice;
