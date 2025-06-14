import { Column } from '@ant-design/plots';
import { useEffect, useState } from 'react';
import { message } from 'antd';
import './Last7DaysRevenueChart.css';
import { API_DOMAIN } from '../../../config';

function Last7DaysRevenueChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`${API_DOMAIN}api/invoices/last-7-days`)
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(item => ({
                    revenue: typeof item.revenue === 'number' ? item.revenue : 0,
                    date: new Date(item.date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit'
                    })
                }));
                setData(formatted);
            })
            .catch(err => {
                console.error("Lỗi khi tải báo cáo doanh thu:", err);
                message.error("Không thể tải dữ liệu báo cáo doanh thu 7 ngày");
            });
    }, []);

    const config = {
        data,
        xField: 'date',
        yField: 'revenue',
        columnWidthRatio: 0.6,
        color: () => 'l(270) 0:#6EC5FF 1:#1890FF', // gradient xanh hiện đại
        label: false,
        xAxis: {
            label: {
                style: {
                    fontSize: 13,
                    fill: '#555'
                },
            },
        },
        yAxis: {
            label: {
                formatter: (val) => {
                    const num = Number(val);
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
                    return num;
                },
                style: {
                    fontSize: 13,
                    fill: '#555'
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
            formatter: (datum) => ({
                name: 'Doanh thu',
                value: datum.revenue.toLocaleString('vi-VN') + 'đ',
            }),
        },
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3>Báo cáo thống kê 7 ngày trước</h3>
                <p className="subtitle">Doanh thu theo ngày</p>
            </div>
            <Column {...config} style={{ height: 300 }} />
        </div>
    );
}

export default Last7DaysRevenueChart;
