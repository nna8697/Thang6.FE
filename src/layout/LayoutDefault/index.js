import { Layout } from "antd";
import "./LayoutDefault.scss";
import logo from "../../images/logo.png";
import logoFold from "../../images/logo-fold.png";
import { SearchOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import Notify from "../../components/Notify";
import MenuSider from "../../components/MenuSider";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { getCookie } from "../../helpers/cookies";
import { useSelector } from "react-redux";

const { Header, Footer, Sider, Content } = Layout;

function LayoutDefault() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const token = getCookie("token");

    const userName = getCookie("fullname");
    // token = 123;
    const isLogin = useSelector(state => state.loginReducer);

    // Điều hướng nếu không có token
    useEffect(() => {
        if (!token) {
            navigate("/Login");
        }
    }, [token, navigate]);

    // Nếu chưa login, không render layout
    if (!token) return null;

    return (
        <Layout className="layout-default">
            <header className="header">
                <div className={"header__logo " + (collapsed && " header__logo--collapsed")}>
                    <p>Tháng 6 Cafe</p>
                </div>
                <div className="header__nav">
                    <div className="header__nav-left">
                        <div className="header__collapse" onClick={() => setCollapsed(!collapsed)}>
                            <MenuUnfoldOutlined />
                        </div>
                        <div className="header__search">
                            {/* <SearchOutlined /> */}
                        </div>
                    </div>
                    <div className="header__nav-right">
                        Xin chào, <b>{userName}</b>
                        <Notify />
                        <NavLink to="/Logout" className="layout-default__search">Đăng xuất</NavLink>
                    </div>

                </div>
            </header>
            <Layout>
                <Sider className="sider" collapsed={collapsed} theme="light">
                    <MenuSider />
                </Sider>
                <div className="layout-default__content">
                    <Content className="content">
                        <Outlet />
                    </Content>
                    <Footer className="footer">
                        © {new Date().getFullYear()} Tháng 6 Cafe V1.2. Created by Kel Min
                    </Footer>
                </div>
            </Layout>
        </Layout>
    );
}

export default LayoutDefault;
