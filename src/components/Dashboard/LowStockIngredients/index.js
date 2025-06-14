import { Card, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { API_DOMAIN } from '../../../config';

function LowStockIngredients() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_DOMAIN}api/ingredients/low-stock`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch low stock ingredients:', err);
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
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            key: 'unit',
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

export default LowStockIngredients;
