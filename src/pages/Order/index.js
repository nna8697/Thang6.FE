import React, { useEffect, useState, useRef } from 'react';
import './Order.scss';
import ProductGrid from '../../components/ProductGrid';
import { Col, Row, message } from 'antd';
import { DeleteOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllCategories } from '../../services/categoriesService';
import { getAllProducts } from '../../services/productsService';
import { getCookie } from '../../helpers/cookies';
import { updateInvoice, createInvoice } from '../../services/invoicesService';

const getProducts = async () => {
    try {
        return await getAllProducts();
    } catch (err) {
        console.error("Error fetching products", err);
        return [];
    }
};

const useCartTotals = (cart, discountType, discountValue) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const type = discountType?.toLowerCase();
    const discount = type === '%' ? (subtotal * discountValue) / 100
        : type === 'vnđ' ? discountValue
            : 0;
    const discountAmount = Math.min(discount, subtotal);
    const total = Math.max(0, subtotal - discountAmount);
    return { subtotal, discountAmount, total };
};

const Order = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cart, setCart] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountType, setDiscountType] = useState('%');
    const [discountValue, setDiscountValue] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState(""); // Ghi chú

    const location = useLocation();
    const navigate = useNavigate();

    const { order } = location.state || {};
    const { subtotal, discountAmount, total } = useCartTotals(cart, discountType, discountValue);
    const userId = getCookie('id');

    const socketRef = useRef(null);

    // Kết nối WebSocket với PrintServer
    useEffect(() => {
        socketRef.current = new WebSocket("ws://localhost:5000");

        socketRef.current.onopen = () => {
            console.log("WebSocket connected to PrintServer");
        };

        socketRef.current.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            socketRef.current?.close();
        };
    }, []);

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchData = async () => {
            const [categoryData, productData] = await Promise.all([
                getAllCategories(),
                getProducts()
            ]);
            setCategories(categoryData);
            setProducts(productData);
            if (categoryData.length > 0) {
                setSelectedCategory(categoryData[0].id);
            }

            if (order) {
                const cartItems = order.orders.map(item => ({
                    id: item.productId,
                    name: item.productName,
                    price: parseFloat(item.price),
                    quantity: item.quantity
                }));
                setCart(cartItems);
                setShowDiscountInput(!!(order.discountType || order.discountValue));
                setDiscountType(order.discountType || '%');
                setDiscountValue(order.discountValue || 0);
                setPaymentMethod(order.paymentmethod === 0 ? "cash" : "transfer");
                //15.8.2025 nnanh bổ sung tính năng thêm ghi chú
                setNote(order.note || "");
            }
        };

        fetchData();
    }, []);

    const handleAddToCart = (product) => {
        const exist = cart.find(item => item.id === product.id);
        if (exist) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const handleRemoveItem = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            message.warning('Giỏ hàng đang trống!');
            return;
        }

        const now = new Date().toISOString();

        const invoiceData = {
            orders: cart.map(item => ({
                price: item.price,
                quantity: item.quantity,
                productId: item.id,
                productName: item.name
            })),
            total: total.toFixed(2),
            modifiedby: userId,
            userName: getCookie('fullname'),
            modifieddate: now,
            status: order ? 2 : 0,
            paymentmethod: paymentMethod === "transfer",
            discountType,
            discountValue,
            discountAmount: discountAmount.toFixed(2),
            editedReason: order?.editedReason || null,
            //15.8.2025 nnanh bổ sung tính năng thêm ghi chú
            note: note || null
        };

        if (!order) {
            invoiceData.createdby = userId;
            invoiceData.createddate = now;
        }

        try {
            setLoading(true);

            const result = order
                ? await updateInvoice(order.id, invoiceData)
                : await createInvoice(invoiceData);

            if (result?.success || result?.id || result?.data || result?.message === "Updated") {
                //Nếu là hóa đơn mới → in ngay và hiện thông báo
                if (!order) {
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({
                            type: 'print',
                            invoice: {
                                id: result.data?.id || result.id || Date.now(),
                                items: cart,
                                discountType,
                                discountValue,
                                discountAmount,
                                total,
                                user: getCookie('fullname'),
                                paymentMethod,
                                createdAt: new Date().toLocaleString('vi-VN'),
                                note
                            }
                        }));
                    }

                    // Thông báo thành công
                    Swal.fire({
                        title: '🎉 Thanh toán thành công',
                        html: `
                <p><strong>Tổng:</strong> ${parseFloat(total).toLocaleString('vi-VN')}₫</p>
                <p><strong>Số lượng món:</strong> ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
            `,
                        icon: 'success',
                        confirmButtonText: 'Đóng',
                        customClass: { popup: 'swal2-border-radius' }
                    }).then(() => {
                        navigate('/order');
                    });;
                } else {
                    //Nếu là hóa đơn chỉnh sửa → hỏi có in không trước
                    Swal.fire({
                        title: 'In hóa đơn?',
                        text: "Bạn có muốn in hóa đơn sau khi chỉnh sửa thành công?",
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Có, in ngay',
                        cancelButtonText: 'Không'
                    }).then((resultConfirm) => {
                        if (resultConfirm.isConfirmed) {
                            if (socketRef.current?.readyState === WebSocket.OPEN) {
                                socketRef.current.send(JSON.stringify({
                                    type: 'print',
                                    invoice: {
                                        id: order.id,
                                        items: cart,
                                        discountType,
                                        discountValue,
                                        discountAmount,
                                        total,
                                        user: getCookie('fullname'),
                                        paymentMethod,
                                        createdAt: new Date().toLocaleString('vi-VN'),
                                        note
                                    }
                                }));
                            }
                        }

                        // Sau khi hỏi in xong mới hiện thông báo thành công
                        Swal.fire({
                            title: '🎉 Sửa hóa đơn thành công',
                            html: `
                    <p><strong>Tổng:</strong> ${parseFloat(total).toLocaleString('vi-VN')}₫</p>
                    <p><strong>Số lượng món:</strong> ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                `,
                            icon: 'success',
                            confirmButtonText: 'Đóng',
                            customClass: { popup: 'swal2-border-radius' }
                        }).then(() => {
                            navigate('/order');
                        });
                    });
                }

                // Reset dữ liệu
                setCart([]);
                setDiscountValue(0);
                setShowDiscountInput(false);
                setNote("");
            } else {
                message.error(`${order ? 'Sửa' : 'Thanh toán'} thất bại: ${result.message || 'Lỗi không xác định'}`);
            }
        } catch (error) {
            console.error('Lỗi:', error);
            message.error(`${order ? 'Sửa' : 'Thanh toán'} thất bại: Không kết nối được máy chủ`);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(categoryFilter.toLowerCase())
    );

    const filteredProducts = products.filter(
        p => p.categoryId === selectedCategory && p.status === 1
    );

    return (
        <div className="order-pos">
            <Row gutter={[20, 20]}>
                <Col xxl={3} xl={3} lg={3} md={3} sm={3} xs={3}>
                    <div className="category-list">
                        <input
                            className="category-search"
                            type="text"
                            placeholder="Tìm kiếm danh mục"
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                        />
                        {filteredCategories.map(cat => (
                            <div
                                key={cat.id}
                                className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </div>
                        ))}
                    </div>
                </Col>

                <Col xxl={14} xl={14} lg={14} md={14} sm={14} xs={14}>
                    <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
                </Col>

                <Col xxl={7} xl={7} lg={7} md={7} sm={7} xs={7}>
                    <div className="cart-panel">
                        <h3><ShoppingCartOutlined /> Giỏ hàng ({cart.length})</h3>

                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <div className="empty-cart">Chưa có món nào</div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="item-info">
                                            <span className="item-quantity">x{item.quantity}</span>
                                            <span className="item-name">{item.name}</span>
                                        </div>
                                        <div className="item-actions">
                                            <span className="item-price">
                                                {item.price.toLocaleString('vi-VN')}₫
                                            </span>
                                            <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>
                                                <DeleteOutlined />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cart-footer">
                            <div className="discount">
                                <div>Giảm giá</div>
                                {showDiscountInput && (
                                    <div className="discount-input">
                                        <input
                                            type="number"
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                                            placeholder="Nhập số giảm"
                                        />
                                        <select
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value)}
                                        >
                                            <option value="%">%</option>
                                            <option value="vnđ">₫</option>
                                        </select>
                                    </div>
                                )}
                                <button onClick={() => {
                                    setShowDiscountInput(prev => {
                                        const next = !prev;
                                        if (!next) setDiscountValue(0);
                                        return next;
                                    });
                                }}>
                                    <PlusOutlined />
                                </button>
                            </div>

                            <div className="payment-method">
                                <label htmlFor="paymentMethod">Phương thức thanh toán:</label>
                                <select
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="cash">Tiền mặt</option>
                                    <option value="transfer">Chuyển khoản</option>
                                </select>
                            </div>
                            {/* 15.8.2025 nnanh bổ sung tính năng thêm ghi chú */}
                            {/* Ô Ghi chú */}
                            <div className="note-section">
                                <label htmlFor="note">Ghi chú:</label>
                                <textarea
                                    id="note"
                                    placeholder="Nhập ghi chú cho hóa đơn..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            <div className="cart-total">
                                Tổng: <strong>{total.toLocaleString('vi-VN')}₫</strong>
                            </div>
                            <button
                                className="checkout-btn"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : order ? 'Lưu chỉnh sửa' : 'Thanh toán'}
                            </button>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Order;
