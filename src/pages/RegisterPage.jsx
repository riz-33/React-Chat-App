import {
  Select,
  message,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { BsGenderAmbiguous } from "react-icons/bs";
import {
  auth,
  createUserWithEmailAndPassword,
  db,
  doc,
  setDoc,
  serverTimestamp,
} from "../config/firebase";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const { Title } = Typography;
const { Option } = Select;

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (data) => {
    setLoading(true); // Start loading
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      message.success("User Registered Successfully!");

      await setDoc(doc(db, "users", response.user.uid), {
        username: data.username,
        email: data.email,
        password: data.password,
        number: data.phone,
        gender: data.gender,
        city: "Karachi",
        country: "Pakistan",
        uid: response.user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      message.error(`Failed to register. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row>
      <Col xs={2} sm={4} md={4} xl={6}></Col>
      <Col xs={20} sm={16} md={16} xl={12} style={{ marginTop: 60 }}>
        <Card>
          <Title level={2} style={{ textAlign: "center" }}>
            Register
          </Title>
          <Form
            layout="horizontal"
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Row gutter={8}>
              <Col xs={24} sm={16} md={12}>
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Username!",
                    },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={16} md={12}>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      type: "email",
                      message: "The input is not valid E-mail!",
                    },
                    {
                      required: true,
                      message: "Please input your E-mail!",
                    },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="E-mail" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={16} md={12}>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please input your password!",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={16} md={12}>
                <Form.Item
                  name="confirm"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The new password that you entered do not match!"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm Password"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={16} md={12}>
                <Form.Item
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Please input your phone number!",
                    },
                  ]}
                >
                  <PhoneInput
                    country={"pk"}
                    placeholder="Phone Number"
                    inputStyle={{ width: "100%" }}
                    buttonStyle={{ borderColor: "#d9d9d9" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={16} md={12}>
                <Form.Item
                  name="gender"
                  rules={[
                    {
                      required: true,
                      message: "Please select gender!",
                    },
                  ]}
                >
                  <Select
                    prefix={<BsGenderAmbiguous />}
                    placeholder="Select Your Gender"
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ textAlign: "center" }} label={null}>
              <Button
                style={{
                  backgroundColor: "#58aeff",
                  marginBottom: 10,
                  color: "white",
                }}
                block
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
              >
                Sign Up
              </Button>
              or <a href="/">Login now!</a>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={2} sm={4} md={4} xl={6}></Col>
    </Row>
  );
};
