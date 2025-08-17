import React from 'react';
import { Modal, Descriptions, Tag, Table } from 'antd';
import dayjs from 'dayjs';

const formatCurrency = (value) => {
    const number = Number(value);
    if (isNaN(number)) return value;
    return number.toLocaleString('vi-VN');
};

const statusMap = {
    0: { text: 'Bình thường', color: 'green' },
    1: { text: 'Đã xoá', color: 'red' },
    2: { text: 'Hoá đơn chỉnh sửa', color: 'orange' },
};

const InvoiceDetailModal = ({ order, onClose }) => {


    if (!order) return null;

    const {
        code,
        total,
        discount,
        creator,
        createdAt,
        status,
        deletedReason,
        orders = [],
    } = order;

    debugger

    const columns = [
        {
            title: 'Tên món',
            dataIndex: 'productName',
            key: 'name',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${formatCurrency(price)}₫`,
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (record) =>
                `${formatCurrency(Number(record.price) * Number(record.quantity))}₫`,
        },
    ];

    return (
        <Modal
            title={`Chi tiết hoá đơn ${code}`}
            open={!!order}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Mã hoá đơn">{code}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">{formatCurrency(total)}₫</Descriptions.Item>
                <Descriptions.Item label="Giảm giá">{formatCurrency(discount)}₫</Descriptions.Item>
                <Descriptions.Item label="Người tạo">{creator}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{dayjs(createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Giờ tạo">{dayjs(createdAt).format('HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
                </Descriptions.Item>
                {status === 1 && (
                    <Descriptions.Item label="Lý do xoá">{deletedReason}</Descriptions.Item>
                )}
            </Descriptions>

            <h3 style={{ marginTop: 20 }}>Danh sách món</h3>
            <Table
                dataSource={orders}
                columns={columns}
                rowKey={(record, index) => index}
                pagination={false}
                size="small"
            />
        </Modal>
    );
};

export default InvoiceDetailModal;
