import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkLogin } from "../../actions/login";
import { setCookie } from "../../helpers/cookies";
import { login } from "../../services/usersService";
import "./Login.scss";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ State hiển thị lỗi
  const [errorMessage, setErrorMessage] = useState("");

  const onFinish = async (values) => {
    const { username, password } = values;
    setErrorMessage(""); // reset lỗi cũ

    try {
      const response = await login(username, password);

      // ✅ Đăng nhập thành công
      if (response.status === 200) {
        message.success("Đăng nhập thành công!");

        setCookie("id", response.user.id, 1);
        setCookie("fullname", response.user.fullname, 1);
        setCookie("role", response.user.role === 0 ? "admin" : "user", 1);
        setCookie("token", response.token, 1);

        dispatch(
          checkLogin({
            id: response.user.id,
            fullname: response.user.fullname,
            role: response.user.role,
            token: response.token,
          })
        );

        navigate("/");
        return;
      }

      // ❌ Sai tài khoản / mật khẩu
      if (response.status === 401) {
        setErrorMessage("Tên đăng nhập hoặc mật khẩu không chính xác");
        return;
      }

      // ❌ Lỗi khác
      setErrorMessage("Đăng nhập thất bại, vui lòng thử lại!");

    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Tên đăng nhập hoặc mật khẩu không chính xác");
      } else {
        setErrorMessage("Không thể kết nối đến máy chủ");
      }
      console.error(error);
    }
  };

  const onFinishFailed = () => {
    setErrorMessage("Vui lòng điền đầy đủ thông tin đăng nhập");
  };

  return (
    <div className="login-container">
      <div className="login-bg" />

      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <img src="https://bom.edu.vn/public/upload/2024/12/capybara-meme-anime-2.webp" alt="Logo" className="login-logo" />
          <Title level={2} className="login-title">
            Tháng 6 Cafe
          </Title>
        </div>

        {/* ✅ Thông báo lỗi hiển thị rõ cho người dùng */}
        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
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
            <Button
              type="primary"
              htmlType="submit"
              className="login-btn"
              size="large"
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
