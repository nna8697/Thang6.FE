import { Card, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { API_DOMAIN } from '../../../config';

function MonthlyImportTotal() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_DOMAIN}api/warehouse/getMonthlyTotal`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch monthly total:', err);
                setLoading(false);
            });
    }, []);

    const columns = [
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: text => (text === 'ingredient' ? 'Nguyên liệu' : 'Dụng cụ'),
        },
        {
            title: 'Tổng tiền (đ)',
            dataIndex: 'total',
            key: 'total',
            render: value => value.toLocaleString(),
        },
    ];

    const tableData = data
        ? Object.entries(data).map(([type, total]) => ({
            key: type,
            type,
            total,
        }))
        : [];

    return (
        <Card style={{ height: '400px' }}>
            {loading ? <Spin /> : <Table columns={columns} dataSource={tableData} pagination={false} size="small" />}
        </Card>
    );
}

export default MonthlyImportTotal;
