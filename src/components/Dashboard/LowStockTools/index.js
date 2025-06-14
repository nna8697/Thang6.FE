import { Card, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { API_DOMAIN } from '../../../config';

function LowStockTools() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_DOMAIN}api/tools/low-stock`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch low stock tools:', err);
                setLoading(false);
            });
    }, []);

    const columns = [
        {
            title: 'STT',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Loại',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
    ];

    return (
        <Card style={{ height: '400px' }}>
            {loading ? <Spin /> : <Table columns={columns} dataSource={data} rowKey="id" pagination={false} size="small" />}
        </Card>
    );
}

export default LowStockTools;
