import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import { Link, useNavigate } from "react-router-dom";
import Authentication from "../../components/authentication/Authentication";
import api from "../../config/axios";
import { toast } from "react-toastify";
import { useState } from "react";
import "./Register.scss";

function Register() {
  const [form] = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Trạng thái loading

  const handleRegister = async (values) => {
    setLoading(true); // Bật loading
    try {
      const response = await api.post("user/register", {
        userName: values.userName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again!");
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  return (
    <Authentication>
      <div className="containerer">
        <div className="Register">
          <h2 className="Register__title">Create Your Account</h2>
          <Form form={form} labelCol={{ span: 24 }} onFinish={handleRegister}>
            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { type: "email", message: "Please enter a valid email address!" },
                { required: true, message: "Email cannot be blank!" },
              ]}
            >
              <Input className="Register__input" placeholder="Enter your email" />
            </Form.Item>

            {/* Phone */}
            <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone cannot be blank!" }]}>
              <Input className="Register__input" placeholder="Enter your phone" />
            </Form.Item>

            {/* Username */}
            <Form.Item
              label="Username"
              name="userName"
              rules={[{ required: true, message: "Username cannot be blank!" }]}
            >
              <Input className="Register__input" placeholder="Enter your username" />
            </Form.Item>

            {/* Password */}
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password cannot be blank!" }]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("The two passwords do not match!");
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm your password" />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="Register__button"
                loading={loading} // Hiển thị loading khi submit
              >
                Register
              </Button>
            </Form.Item>
          </Form>

          <div className="Register__middle">
            <Link to="/login" className="Register__back-login">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Authentication>
  );
}

export default Register;
