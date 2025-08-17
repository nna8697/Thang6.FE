import { Column } from '@ant-design/plots';
import { useEffect, useState } from 'react';
import { message } from 'antd';
import './Last7DaysRevenueChart.css';
import { API_DOMAIN } from '../../../config';

function Last7DaysRevenueChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_DOMAIN}api/invoices/last-7-days`);
                const result = await res.json();
                if (Array.isArray(result)) {
                    setData(result);
                } else {
                    console.error('Dữ liệu không hợp lệ:', result);
                }
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            }
        }

        fetchData();
    }, []);

    const config = {
        data,
        xField: 'date',
        yField: 'revenue',
        columnWidthRatio: 0.6,
        label: false,
        xAxis: {
            label: {
                style: {
                    fontSize: 13,
                    fill: '#555',
                },
            },
        },
        yAxis: {
            min: 0,
            label: {
                formatter: (val) => {
                    const num = Number(val);
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
                    return num;
                },
                style: {
                    fontSize: 13,
                    fill: '#555',
                },
            },
            grid: {
                line: {
                    style: {
                        stroke: '#f0f0f0',
                        lineDash: [4, 4],
                    },
                },
            },
        },
        tooltip: {
            formatter: (datum) => {
                const revenue =
                    typeof datum.revenue === 'number' && !isNaN(datum.revenue)
                        ? datum.revenue
                        : 0;
                return {
                    name: 'Doanh thu',
                    value: revenue.toLocaleString('vi-VN') + '₫',
                };
            },
        },
        // 👇 Hiển thị màu cột theo doanh thu
        columnStyle: ({ revenue }) => {
            if (revenue === 0) {
                return { fill: '#d9d9d9' }; // màu xám khi không có doanh thu
            }
            return { fill: 'l(270) 0:#6EC5FF 1:#1890FF' }; // gradient xanh khi có doanh thu
        },
    };

    return (
        <div style={{ padding: 20, background: '#fff', borderRadius: 8 }}>
            <h3 style={{ textAlign: 'center', marginBottom: 8 }}>
                Báo cáo thống kê 7 ngày trước
            </h3>
            <p style={{ textAlign: 'center', fontSize: 14, color: '#888', marginBottom: 20 }}>
                Doanh thu theo ngày (cột xám = không có doanh thu)
            </p>
            <Column {...config} />
        </div>
    );
}

export default Last7DaysRevenueChart;
