import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkLogin } from '../../actions/login';
import { setCookie } from "../../helpers/cookies";
import { login } from '../../services/usersService';
import "./Login.scss";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    const { username, password } = values;
    try {
      const response = await login(username, password);
      //debugger
      if (response.status !== 200) {
        message.error("Đăng nhập thất bại!");
        return;
      }
      message.success("Đăng nhập thành công!");
      setCookie("id", response.user.id, 1);
      setCookie("fullname", response.user.fullname, 1);
      setCookie('role', response.user.role == 0 ? "admin" : "user", 1);
      setCookie("token", response.token, 1);
      //   dispatch(checkLogin(true));

      //   dispatch(setUser({
      //     id: user.id,
      //     fullname: user.fullname,
      //     role: user.role, // 👈 lưu role
      //     token: token,
      // }));

      // Sau khi login thành công:
      //debugger
      dispatch(checkLogin({
        id: response.user.id,
        fullname: response.user.fullname,
        role: response.user.role,
        token: response.token,
      }));

      navigate("/");
    } catch (error) {
      message.error("Lỗi kết nối đến máy chủ!");
      console.error(error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Vui lòng điền đầy đủ thông tin!");
  };

  return (
    <div className="login-container">
      <div className="login-bg" />
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <img src="/hin.png" alt="Logo" className="login-logo" />
          <Title level={2} className="login-title">Tháng 6 Cafe</Title>
        </div>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin"
              size="large"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••"
              size="large"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-btn" size="large" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
