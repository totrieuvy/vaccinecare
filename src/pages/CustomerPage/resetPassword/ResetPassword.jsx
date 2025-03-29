import { Button, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";
import "./ResetPassword.scss";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import api from "../../../config/axios";
import Authentication from "../../../components/authentication/Authentication";

function ResetPassword() {
  const [form] = useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const onFinish = async (values) => {
    try {
      const response = await api.post("user/reset-password", {
        email: email,
        token: token,
        newPassword: values.newPassword,
      });

      message.success("Password has been reset successfully!");
      navigate("/login");
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Authentication>
      <div className="containerer">
        <div className="ResetPassword">
          <h2 className="ResetPassword__title">Reset Your Password</h2>
          <Form form={form} labelCol={{ span: 24 }} onFinish={onFinish}>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                {
                  required: true,
                  message: "Please enter your new password!",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters!",
                },
              ]}
            >
              <Input.Password className="ResetPassword__input" placeholder="Enter new password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password className="ResetPassword__input" placeholder="Confirm new password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="ResetPassword__button">
                Reset Password
              </Button>
            </Form.Item>
          </Form>
          <div className="ResetPassword__middle">
            <Link to="/login" className="ResetPassword__back-login">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Authentication>
  );
}

export default ResetPassword;
