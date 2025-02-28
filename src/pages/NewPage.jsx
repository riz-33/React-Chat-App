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
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
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

export const NewRegisterPage = () => {
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
        bio: data.intro,
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
      <Col xs={20} sm={16} md={12} xl={8} style={{ marginTop: 100 }}>
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

              {/* <Form.Item
              name="nickname"
              
              tooltip="What do you want others to call you?"
              rules={[
                {
                  required: true,
                  message: "Please input your nickname!",
                  whitespace: true,
                  },
                  ]}
                  >
                  <Input placeholder="Nickname" />
                  </Form.Item> */}

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
                  // placeholder="Gender"
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
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="intro"
                  rules={[
                    {
                      required: true,
                      message: "Please input Intro",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Intro"
                    showCount
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item extra="We must make sure that your are a human.">
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
                    <Input placeholder="Captcha" />
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
