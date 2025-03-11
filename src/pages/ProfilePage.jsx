import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
  Space,
  Upload,
  Avatar,
} from "antd";
import PhoneInput from "react-phone-input-2";
import { UserOutlined } from "@ant-design/icons";
import User from "../context/User";
import { useContext, useEffect, useState } from "react";
import { doc, db, updateDoc, onSnapshot } from "../config/firebase";
import "../styles/ChatPage.css";

const ProfilePage = () => {
  const user = useContext(User).user;
  const { Option } = Select;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          // Resize logic
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height *= maxWidth / width;
              width = maxWidth;
            } else {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            },
            "image/jpeg",
            1
          );
        };
      };
    });
  };

  const props = {
    name: "file",
    async beforeUpload(file) {
      return await compressImage(file);
    },
    action: "https://api.cloudinary.com/v1_1/dxzqtndlo/image/upload",
    data: (file) => ({
      upload_preset: "expense_tracker",
      file,
    }),

    async onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        const url = info.file.response.secure_url;
        const fileRef = doc(db, "users", user.uid);

        await updateDoc(fileRef, { avatar: url });
        setAvatarUrl(url);

        message.success(`Profile picture updated successfully`);
      } else if (info.file.status === "error") {
        message.error(`Failed to update profile.`);
      }
    },
  };

  useEffect(() => {
    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        form.setFieldsValue(userData);
        setAvatarUrl(userData.avatar);
      }
    });
    return () => unsubscribe();
  }, [user.uid, form]);

  const onFinish = async (values) => {
    setLoading(true);
    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        username: values.username,
        email: values.email,
        number: values.number,
        gender: values.gender,
        country: values.country,
        city: values.city,
      });
      message.success("Profile updated successfully!");
    } catch (error) {
      console.log(error);
      message.error("Failed to update profile.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ marginTop: "20px" }}>
      <Col xs={2} sm={4} md={4} lg={5} xl={6}></Col>
      <Col xs={20} sm={16} md={16} lg={14} xl={12}>
        <Card>
          <Typography
            style={{ fontSize: 20, textAlign: "center", marginBottom: 10 }}
          >
            User Profile
          </Typography>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            scrollToFirstError
          >
            <div
              style={{
                padding: 5,
                marginBottom: 15,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Upload style={{ justifyContent: "center" }} {...props}>
                <Space
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  direction="vertical"
                  size={16}
                >
                  <Avatar src={avatarUrl} size={150} icon={<UserOutlined />} />
                </Space>
              </Upload>
            </div>

            <Row>
              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  // style={{ width: "90%" }}
                  name="username"
                  label="Username"
                  initialValue={user.username.toUpperCase()}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  // style={{ width: "100%" }}
                  initialValue={user.email}
                  name="email"
                  label="E-mail"
                  rules={[
                    {
                      type: "email",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  // style={{ width: "100%" }}
                  initialValue={user.number}
                  name="number"
                  label="Phone Number"
                >
                  <PhoneInput
                    country={"pk"}
                    placeholder="Phone Number"
                    inputStyle={{ width: "100%" }}
                    buttonStyle={{ borderColor: "#d9d9d9" }}
                  />
                </Form.Item>
              </Col>
              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  style={{ width: "100%" }}
                  initialValue={user.gender}
                  name="gender"
                  label="Gender"
                >
                  <Select placeholder="Select Your Gender">
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item
                  name="country"
                  label="Country"
                  initialValue={user.country}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col style={{ padding: 3 }} xs={24} sm={16} md={12}>
                <Form.Item name="city" label="City" initialValue={user.city}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              style={{ display: "flex", justifyContent: "center", margin: 12 }}
            >
              <Flex gap="small">
                <Button
                  loading={loading}
                  disabled={loading}
                  style={{ backgroundColor: "#1a237e" }}
                  type="primary"
                  htmlType="submit"
                >
                  Update
                </Button>
                <Button danger onClick={() => form.resetFields()}>
                  Reset
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={2} sm={4} md={4} lg={5} xl={6}></Col>
    </Row>
  );
};
export default ProfilePage;
