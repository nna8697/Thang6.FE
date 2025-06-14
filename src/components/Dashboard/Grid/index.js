import { Col, Row, Select, DatePicker, Space, message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
    DollarOutlined,
    RiseOutlined,
    GiftOutlined,
    FileTextOutlined,
    ArrowDownOutlined, // Import icon mũi tên đi xuống
    ArrowUpOutlined // Import icon mũi tên đi lên
} from '@ant-design/icons';
import "./Grid.scss";
import CardItem from '../CardItem';
import MonthlyImportTotal from '../MonthlyImportTotal';
import LowStockIngredients from '../LowStockIngredients';
import LowStockTools from '../LowStockTools';
import Last7DaysRevenueChart from '../Last7DaysRevenueChart';
import { API_DOMAIN } from '../../../config';

const { Option } = Select;
const { RangePicker } = DatePicker;

const timeOptions = [
    { label: "Hôm nay", value: "today" },
    { label: "Hôm qua", value: "yesterday" },
    { label: "7 ngày qua", value: "last7" },
    { label: "30 ngày qua", value: "last30" },
    { label: "Tháng này", value: "thisMonth" },
    { label: "Tháng trước", value: "lastMonth" },
    { label: "Tuỳ chỉnh", value: "custom" }
];

function Grid() {
    const [selectedRange, setSelectedRange] = useState("today");
    const [customDates, setCustomDates] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalDiscountAndCommission: 0,
        totalInvoices: 0,
        revenueChangePercent: 0,
    });
    const getDateRange = () => {
        const today = moment().endOf("day");
        const start = moment().startOf("day");

        switch (selectedRange) {
            case "today":
                return [start, today];
            case "yesterday":
                return [moment().subtract(1, 'day').startOf("day"), moment().subtract(1, 'day').endOf("day")];
            case "last7":
                return [moment().subtract(6, 'days').startOf("day"), today];
            case "last30":
                return [moment().subtract(29, 'days').startOf("day"), today];
            case "thisMonth":
                return [moment().startOf("month"), moment().endOf("month")];
            case "lastMonth":
                return [moment().subtract(1, 'month').startOf("month"), moment().subtract(1, 'month').endOf("month")];
            case "custom":
                return customDates.length === 2 ? customDates : [start, today];
            default:
                return [start, today];
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        const [fromDate, toDate] = getDateRange();

        // fetch(`http://localhost:2025/api/dashboard/stats?from=${fromDate.format("YYYY-MM-DD")}&to=${toDate.format("YYYY-MM-DD")}`, {
        //     signal: controller.signal
        // })
        fetch(`${API_DOMAIN}api/dashboard/stats?from=${fromDate.format("YYYY-MM-DD")}&to=${toDate.format("YYYY-MM-DD")}`, {
            signal: controller.signal
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => setStats(data))
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Fetch stats failed:', err);
                    message.error('Không thể tải dữ liệu');
                }
            });

        return () => controller.abort();
    }, [selectedRange, customDates]);

    return (
        <>
            <div className="order-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <Space>
                    <span>Chọn khoảng thời gian:</span>
                    <Select
                        style={{ width: 200 }}
                        value={selectedRange}
                        onChange={value => setSelectedRange(value)}
                    >
                        {timeOptions.map(option => (
                            <Option key={option.value} value={option.value}>{option.label}</Option>
                        ))}
                    </Select>
                    {selectedRange === 'custom' && (
                        <RangePicker
                            value={customDates}
                            onChange={dates => setCustomDates(dates)}
                            format="DD/MM/YYYY"
                        />
                    )}
                </Space>
            </div>

            <Row gutter={[10, 10]}>
                <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12}>
                    <CardItem title="Tổng doanh thu" icon={<DollarOutlined className="card-icon primary" />}>
                        {(stats.totalRevenue ?? 0).toLocaleString()}đ
                    </CardItem>
                </Col>
                <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12}>
                    <CardItem title="Tăng/Giảm so với trước đó" icon={
                        stats.revenueChangePercent < 0 ? (
                            <ArrowDownOutlined className="card-icon" style={{ color: 'red' }} />
                        ) : (
                            <ArrowUpOutlined className="card-icon" style={{ color: 'green' }} />
                        )
                    }>
                        {stats.revenueChangePercent === null ? "Không có dữ liệu" :
                            `${stats.revenueChangePercent >= 0 ? "+" : ""}${stats.revenueChangePercent.toFixed(2)}%`
                        }
                    </CardItem>
                </Col>
                <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12}>
                    <CardItem title="Tổng giảm giá & hoa hồng" icon={<GiftOutlined className="card-icon warning" />}>
                        {(stats.totalDiscountAndCommission ?? 0).toLocaleString()}đ
                    </CardItem>
                </Col>
                <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={12}>
                    <CardItem title="Tổng số hoá đơn" icon={<FileTextOutlined className="card-icon info" />}>
                        {stats.invoiceCount ?? 0}
                    </CardItem>
                </Col>
            </Row>

            {/* Các Box giả định khác */}
            <Row gutter={[20, 20]} className='mt-20'>
                <Col xxl={8}>
                    <CardItem title="Tổng tiền nhập hàng trong tháng"  >
                        <MonthlyImportTotal></MonthlyImportTotal>
                    </CardItem>

                </Col>
                <Col xxl={8}>
                    <CardItem title="Nguyên liệu sắp hết">
                        <LowStockIngredients></LowStockIngredients>
                    </CardItem>
                </Col>
                <Col xxl={8}>
                    <CardItem title="Vật dụng sắp hết">
                        <LowStockTools></LowStockTools>
                    </CardItem>
                </Col>
            </Row>
            <Row gutter={[20, 20]} className='mt-20'>
                <Col xxl={16}>
                    <CardItem title="Báo cáo thống kê 7 ngày trước" >
                        <Last7DaysRevenueChart></Last7DaysRevenueChart>
                        {/* http://localhost:2025/api/revenue/last-7-days */}
                        {/* [
  { "date": "2025-05-04", "revenue": 0 },
  { "date": "2025-05-05", "revenue": 25000 },
  { "date": "2025-05-06", "revenue": 0 },
  { "date": "2025-05-07", "revenue": 0 },
  { "date": "2025-05-08", "revenue": 137000 },
  { "date": "2025-05-09", "revenue": 0 },
  { "date": "2025-05-10", "revenue": 25000 }
] */}
                    </CardItem>
                </Col>
                <Col xxl={8}><CardItem title="Top 10 mặt hàng bán chạy" style={{ height: "400px" }} /></Col>
            </Row>
            {/* <Row gutter={[20, 20]} className='mt-20'>
                <Col xxl={8}><CardItem title="Box 9" style={{ height: "400px" }} /></Col>
                <Col xxl={8}><CardItem title="Box 10" style={{ height: "400px" }} /></Col>
                <Col xxl={8}><CardItem title="Box 11" style={{ height: "400px" }} /></Col>
            </Row> */}
        </>
    );
}

export default Grid;
