import { Button, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";
import "./ForgotPassword.scss";
import { Link, useNavigate } from "react-router-dom";
import Authentication from "../../components/authentication/Authentication";
import axios from "axios";
import api from "../../config/axios";

function ForgotPassword() {
  const [form] = useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await api.post("user/forgot-password", {
        email: values.email,
      });

      message.success("Reset password link has been sent to your email!");
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Authentication>
      <div className="containerer">
        <div className="ForgotPassword">
          <h2 className="ForgotPassword__title">Forgot Your Password?</h2>
          <Form form={form} labelCol={{ span: 24 }} onFinish={onFinish}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  type: "email",
                  required: true,
                  message: "Please enter a valid email address!",
                },
                {
                  required: true,
                  message: "Email cannot be blank!",
                },
              ]}
            >
              <Input className="ForgotPassword__input" placeholder="Enter your email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="ForgotPassword__button">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <div className="ForgotPassword__middle">
            <Link to="/login" className="ForgotPassword__back-login">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Authentication>
  );
}

export default ForgotPassword;
