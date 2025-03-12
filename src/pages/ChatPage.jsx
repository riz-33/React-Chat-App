import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Sidebar,
  ConversationList,
  Conversation,
  Avatar,
  ConversationHeader,
  EllipsisButton,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import {
  db,
  collection,
  auth,
  signOut,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  addDoc,
  orderBy,
  updateDoc,
  doc,
} from "../config/firebase";
import User from "../context/User";
import { useCallback, useContext, useEffect, useState } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { formatDistance } from "date-fns";
import "../styles/ChatPage.css";
import { Col, Divider, Drawer, Row } from "antd";
import { useNavigate } from "react-router-dom";
const DescriptionItem = ({ title, content }) => (
  <div className="site-description-item-profile-wrapper">
    <p className="site-description-item-profile-p-label">{title}:</p>
    {content}
  </div>
);

const capitalizeWords = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const ChatPage = () => {
  const user = useContext(User).user;
  user.username = capitalizeWords(user.username || "");
  const logOut = () => signOut(auth);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const [chatContainerStyle, setChatContainerStyle] = useState({});
  const [conversationContentStyle, setConversationContentStyle] = useState({});
  const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState({});
  const [messageInputValue, setMessageInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [clickedMessage, setClickedMessage] = useState(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const handleMessageClick = (id) => {
    setClickedMessage(clickedMessage === id ? null : id);
  };
  const handleBackClick = () => setSidebarVisible(!sidebarVisible);
  const handleConversationClick = useCallback(() => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [sidebarVisible, setSidebarVisible]);

  useEffect(() => {
    if (sidebarVisible) {
      setSidebarStyle({
        display: "flex",
        flexBasis: "auto",
        width: "100%",
        maxWidth: "100%",
      });
      setConversationContentStyle({
        display: "flex",
      });
      setConversationAvatarStyle({
        marginRight: "1em",
      });
      setChatContainerStyle({
        display: "none",
      });
    } else {
      setSidebarStyle({});
      setConversationContentStyle({});
      setConversationAvatarStyle({});
      setChatContainerStyle({});
    }
  }, [
    sidebarVisible,
    setSidebarVisible,
    setConversationContentStyle,
    setConversationAvatarStyle,
    setSidebarStyle,
    setChatContainerStyle,
  ]);

  const chatId = (currentId) => {
    let id = "";
    if (user.uid < currentId) {
      id = `${user.uid}${currentId}`;
    } else {
      id = `${currentId}${user.uid}`;
    }
    return id;
  };

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("email", "!=", user.email)
        );
        onSnapshot(q, (querySnapshot) => {
          let users = [];
          querySnapshot.forEach((doc) => {
            const userData = { ...doc.data(), id: doc.id };
            userData.username = capitalizeWords(userData.username || "");
            users.push(userData);
          });

          users.sort((a, b) => {
            const lastMsgA = a.lastMessages?.[chatId(a.id)]?.timeStamp;
            const lastMsgB = b.lastMessages?.[chatId(b.id)]?.timeStamp;

            if (!lastMsgA) return 1;
            if (!lastMsgB) return -1;

            const timeA = lastMsgA.seconds || 0;
            const timeB = lastMsgB.seconds || 0;

            return timeB - timeA;
          });

          setChats(users);

          if (users.length > 0) {
            setCurrentChat(users[0]); 
          }
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getAllUsers();
  }, [user.email]);

  const onSend = async () => {
    setMessageInputValue("");

    const messageData = {
      message: messageInputValue,
      sentTime: new Date().toISOString(),
      sender: user.uid,
      receiver: currentChat.uid,
      senderName: user.username,
      receiverName: currentChat.username,
      chatId: chatId(currentChat.uid),
      timeStamp: serverTimestamp(),
    };

    await addDoc(collection(db, "messages"), messageData);

    const lastMessageData = {
      lastMessage: messageInputValue,
      timeStamp: serverTimestamp(),
    };

    await updateDoc(doc(db, "users", currentChat.uid), {
      [`lastMessages.${chatId(currentChat.uid)}`]: lastMessageData,
    });

    await updateDoc(doc(db, "users", user.uid), {
      [`lastMessages.${chatId(currentChat.uid)}`]: lastMessageData,
    });
  };

  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", chatId(currentChat.uid)),
          orderBy("timeStamp", "asc")
        );
        onSnapshot(q, (querySnapshot) => {
          const messages = [];
          querySnapshot.forEach((doc) => {
            messages.push({
              ...doc.data(),
              id: doc.id,
              direction:
                doc.data().sender === user.uid ? "outgoing" : "incoming",
            });
          });
          setChatMessages(messages);
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    getAllMessages();
  }, [currentChat]);

  const myProfile = () => {
    console.log("Button clicked!");
    navigate(`/profile?${user.uid}`);
  };
  return (
    <MainContainer
      responsive
      style={{
        height: "100vh",
      }}
    >
      <Sidebar style={sidebarStyle} position="left" scrollable={false}>
        <ConversationHeader>
          <Avatar
            style={{ cursor: "pointer" }}
            name={user.username}
            src={
              user?.avatar
                ? user?.avatar
                : `https://ui-avatars.com/api/?name=${user?.username}&background=random`
            }
            onClick={myProfile}
          />
          <ConversationHeader.Content userName={user.username} />
          <ConversationHeader.Actions>
            <LogoutOutlined onClick={logOut} style={{ fontSize: 22 }} />
          </ConversationHeader.Actions>
        </ConversationHeader>
        <ConversationList>
          {chats.map((v) => (
            <Conversation
              key={v.id}
              onClick={() => {
                handleConversationClick();
                setCurrentChat(v);
              }}
            >
              <Conversation.Content
                info={v?.lastMessages?.[chatId(v.id)]?.lastMessage || ""}
                name={v?.username}
                style={conversationContentStyle}
              />
              <Avatar
                name={v?.username}
                src={
                  v?.avatar
                    ? v?.avatar
                    : `https://ui-avatars.com/api/?name=${v?.username}&background=random`
                }
                // status="available"
                style={conversationAvatarStyle}
              />
            </Conversation>
          ))}
        </ConversationList>
      </Sidebar>
      <ChatContainer style={chatContainerStyle}>
        <ConversationHeader>
          <ConversationHeader.Back onClick={handleBackClick} />
          <Avatar
            src={
              currentChat?.avatar
                ? currentChat?.avatar
                : `https://ui-avatars.com/api/?name=${currentChat?.username}&background=random`
            }
            name={currentChat?.username}
          />
          <ConversationHeader.Content
            userName={currentChat?.username}
            // info="Active 10 mins ago"
          />

          <ConversationHeader.Actions>
            <EllipsisButton onClick={showDrawer} orientation="vertical" />
            <Drawer
              width={640}
              placement="right"
              closable={false}
              onClose={onClose}
              open={open}
            >
              <p
                className="site-description-item-profile-p"
                style={{
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                User Profile
              </p>
              <div
                style={{
                  height: "180px",
                  width: "180px",
                  justifySelf: "center",
                  marginBottom: 30,
                }}
              >
                <Avatar
                  name={currentChat?.username}
                  src={
                    currentChat?.avatar
                      ? currentChat.avatar
                      : currentChat?.gender === "Male"
                      ? "https://chatscope.io/storybook/react/assets/joe-v8Vy3KOS.svg"
                      : "https://chatscope.io/storybook/react/assets/akane-MXhWvx63.svg"
                  }
                  size="fluid"
                />
              </div>
              <p className="site-description-item-profile-p">Personal</p>
              <Row>
                <Col span={12}>
                  <DescriptionItem
                    title="Full Name"
                    content={currentChat?.username}
                  />
                </Col>
                <Col span={12}>
                  <DescriptionItem
                    title="Gender"
                    content={currentChat?.gender}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem
                    title="City"
                    content={currentChat?.city || ""}
                  />
                </Col>
                <Col span={12}>
                  <DescriptionItem
                    title="Country"
                    content={currentChat?.country || ""}
                  />
                </Col>
              </Row>
              {/* <Row>
                <Col span={24}>
                  <DescriptionItem
                    title="Message"
                    content="Make things as simple as possible but no simpler."
                  />
                </Col>
              </Row> */}
              <Divider />
              <p className="site-description-item-profile-p">Contacts</p>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Email" content={currentChat?.email} />
                </Col>
                <Col span={12}>
                  <DescriptionItem
                    title="Phone Number"
                    content={currentChat?.number}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <DescriptionItem
                    title="Github"
                    content={
                      <a
                        href="https://github.com/riz-33/React-Chat-App"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://github.com/riz-33/React-Chat-App
                      </a>
                    }
                  />
                </Col>
              </Row>
            </Drawer>
          </ConversationHeader.Actions>
        </ConversationHeader>
        <MessageList
        // typingIndicator={<TypingIndicator content="Zoe is typing" />}
        >
          {chatMessages.map((v, i) => (
            <Message
              style={{ cursor: "pointer" }}
              key={i}
              model={{
                direction: v.direction,
                message: v.message,
                position: "single",
                sender: v.senderName,
                sentTime: v.sentTime,
              }}
              onClick={() => handleMessageClick(v.id)}
            >
              <Avatar
                name={v.senderName}
                src={`https://ui-avatars.com/api/?name=${v.senderName}&background=random`}
              />
              {clickedMessage === v.id && (
                <Message.Footer
                  style={{ margin: 0 }}
                  sentTime={formatDistance(new Date(v.sentTime), new Date(), {
                    addSuffix: true,
                  })}
                />
              )}
            </Message>
          ))}
        </MessageList>
        <MessageInput
          placeholder="Type message here"
          value={messageInputValue}
          onChange={(val) => {
            setMessageInputValue(val);
          }}
          onSend={async () => {
            await onSend();
          }}
        />
      </ChatContainer>
    </MainContainer>
  );
};
