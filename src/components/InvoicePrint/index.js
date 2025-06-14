import React from 'react';
import './InvoicePrint.scss';

const InvoicePrint = React.forwardRef(({ cart, userName, total, discountAmount, paymentMethod }, ref) => {
    const now = new Date().toLocaleString('vi-VN');

    return (
        <div ref={ref} className="invoice-print">
            <h2 className="title">HÓA ĐƠN BÁN HÀNG</h2>
            <p>Nhân viên: <strong>{userName}</strong></p>
            <p>Thời gian: {now}</p>
            <p>Phương thức: {paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</p>
            <hr />

            <table className="product-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Giá</th>
                        <th>Tổng</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.price.toLocaleString('vi-VN')}₫</td>
                            <td>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr />
            {discountAmount > 0 && (
                <p>Giảm giá: -{discountAmount.toLocaleString('vi-VN')}₫</p>
            )}
            <p className="total">Tổng tiền: {total.toLocaleString('vi-VN')}₫</p>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>Cảm ơn quý khách!</p>
        </div>
    );
});

export default InvoicePrint;
