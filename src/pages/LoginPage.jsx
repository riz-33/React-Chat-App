import { message, Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import {
  db,
  doc,
  getDoc,
  auth,
  signInWithEmailAndPassword,
} from "../config/firebase";

const { Title } = Typography;

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    setLoading(true); // Start loading
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      message.success("User Login Successfully!");
      const docRef = doc(db, "users", response.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      message.error(`Failed to Login. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Row>
      <Col xs={2} sm={4} md={6} xl={8}></Col>
      <Col xs={20} sm={16} md={12} xl={8} style={{ marginTop: 120 }}>
        <Card>
          <Title underline level={2} style={{ textAlign: "center" }}>
            Login
          </Title>

          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Password"
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
                Sign In
              </Button>
              or <a href="/register">Register now!</a>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={2} sm={4} md={6} xl={8}></Col>
    </Row>
  );
};
