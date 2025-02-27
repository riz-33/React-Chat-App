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
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    </Form.Item>
  );

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
            {/* <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item> */}

            <Form.Item
              name="email"
              label="E-mail"
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
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm Password"
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
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="nickname"
              label="Nickname"
              tooltip="What do you want others to call you?"
              rules={[
                {
                  required: true,
                  message: "Please input your nickname!",
                  whitespace: true,
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>

            <Form.Item
              name="intro"
              label="Intro"
              rules={[
                {
                  required: true,
                  message: "Please input Intro",
                },
              ]}
            >
              <Input.TextArea showCount maxLength={100} />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[
                {
                  required: true,
                  message: "Please select gender!",
                },
              ]}
            >
              <Select placeholder="select your gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Captcha"
              extra="We must make sure that your are a human."
            >
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="captcha"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: "Please input the captcha you got!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Button>Get captcha</Button>
                </Col>
              </Row>
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
