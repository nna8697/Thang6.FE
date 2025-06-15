import React from 'react';
import './ProductGrid.scss';
import { Col, Row } from 'antd';
import { API_DOMAIN } from '../../config';

const ProductGrid = ({ products, onAddToCart }) => (
    <div className="product-grid">
        <Row gutter={[20, 20]}>
            {products.map(product => (
                <Col xs={6} sm={6} md={6} lg={6} key={product.id}>
                    <div
                        className="product-card"
                        onClick={() => onAddToCart(product)}
                    >
                        <div className="product-image">
                            <img
                                src={
                                    product.imgLink
                                        ? `${API_DOMAIN}${product.imgLink}`
                                        : 'https://ongbi.vn/wp-content/uploads/2022/09/CA-PHE-MUOI.jpg'
                                }
                                alt={product.name}
                            />
                        </div>
                        <div className="price">
                            {Number(product.price).toLocaleString('vi-VN')}₫
                        </div>
                        <div className="name">{product.name}</div>
                    </div>
                </Col>
            ))}
        </Row>
    </div>
);

export default ProductGrid;
