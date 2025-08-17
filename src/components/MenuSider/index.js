import { Menu } from "antd";
import {
    ShopOutlined,
    CoffeeOutlined,
    DropboxOutlined,
    HomeOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    UserOutlined,
    TeamOutlined,
    ScheduleOutlined
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { getCookie } from '../../helpers/cookies';
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';

import "./MenuSider.scss";

function MenuSider() {
    const location = useLocation();
    // const [role, setRole] = useState(getCookie('role'));

    // Theo dõi sự thay đổi của cookie (ví dụ sau khi đăng nhập)
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const currentRole = getCookie('role');
    //         setRole(prev => {
    //             if (prev !== currentRole) return currentRole;
    //             return prev;
    //         });
    //     }, 500); // kiểm tra mỗi 500ms

    //     return () => clearInterval(interval);
    // }, []);

    // const isAdmin = role === 'admin';
    //
    const role = useSelector(state => state.loginReducer.user?.role);
    const isAdmin = role === 0;

    const items = [
        {
            key: "/",
            label: <Link to="/">Trang chủ</Link>,
            icon: <HomeOutlined />,
        },
        {
            label: "Bán hàng",
            icon: <ShopOutlined />,
            children: [
                {
                    key: "Order",
                    label: <Link to="/Order">Đặt món</Link>,
                    icon: <ShoppingCartOutlined />,
                },
                {
                    key: "Invoice",
                    label: <Link to="/Invoice">Hoá đơn</Link>,
                    icon: <FileTextOutlined />,
                },
            ],
        },
        {
            label: "Quản lý món",
            icon: <CoffeeOutlined />,
            children: [
                {
                    key: "/Menu",
                    label: <Link to="/Menu">Thực đơn</Link>,
                    icon: <CoffeeOutlined />,
                },
                {
                    key: "/Categories",
                    label: <Link to="/Categories">Danh mục</Link>,
                    icon: <FileTextOutlined />,
                },
            ],
        },
        {
            label: "Kho",
            icon: <DropboxOutlined />,
            children: [
                // {
                //     key: "/TimeSheet",
                //     label: <Link to="/TimeSheet">Chấm công</Link>,
                //     icon: <FileTextOutlined />,
                // },
                {
                    key: "/IngredientManager",
                    label: <Link to="/IngredientManager">Nguyên liệu</Link>,
                    icon: <FileTextOutlined />,
                },
                {
                    key: "/ToolManager",
                    label: <Link to="/ToolManager">Công cụ, dụng cụ</Link>,
                    icon: <ScheduleOutlined />,
                },
                {
                    key: "/WarehouseManager",
                    label: <Link to="/WarehouseManager">Nhập nguyên liệu</Link>,
                    icon: <ScheduleOutlined />,
                },
                // ...(isAdmin
                //     ? [
                //         {
                //             key: "/WarehouseManager",
                //             label: <Link to="/WarehouseManager">Nhập nguyên liệu</Link>,
                //             icon: <ScheduleOutlined />,
                //         },
                //     ]
                //     : []),
            ],
        },
        {
            label: "Tài khoản",
            icon: <UserOutlined />,
            children: [
                // {
                //     key: "/TimeSheet",
                //     label: <Link to="/TimeSheet">Chấm công</Link>,
                //     icon: <FileTextOutlined />,
                // },
                {
                    key: "/Timekeeping",
                    label: <Link to="/Timekeeping">Bảng công</Link>,
                    icon: <FileTextOutlined />,
                },
                // {
                //     key: "/Shift",
                //     label: <Link to="/Shift">Ca làm</Link>,
                //     icon: <ScheduleOutlined />,
                // },
                ...(isAdmin
                    ? [
                        {
                            key: "/Account",
                            label: <Link to="/Account">Quản lý</Link>,
                            icon: <TeamOutlined />,
                        }
                    ]
                    : []),
            ],
        },
    ];

    return (
        <Menu
            className="menu-sider"
            mode="inline"
            items={items}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={["/"]}
        />
    );
}

export default MenuSider;
