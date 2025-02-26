import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Typography,
} from "antd";
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  auth,
  createUserWithEmailAndPassword,
  db,
  doc,
  setDoc,
  serverTimestamp,
} from "../config/firebase";
import { useState } from "react";

const { Title } = Typography;

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
        currency: "PKR",
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
      <Col xs={2} sm={4} md={6} xl={8}></Col>
      <Col xs={20} sm={16} md={12} xl={8} style={{ marginTop: 60 }}>
        <Card>
          <Title underline level={2} style={{ textAlign: "center" }}>
            Register
          </Title>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

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
                type="password"
                placeholder="Password"
              />
            </Form.Item>

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
                type="password"
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <InputNumber
                prefix={<PhoneOutlined />}
                placeholder="Phone Number"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
            <Form.Item style={{ textAlign: "center" }} label={null}>
              <Button
                style={{
                  backgroundColor: "#1a237e",
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
      <Col xs={2} sm={4} md={6} xl={8}></Col>
    </Row>
  );
};
