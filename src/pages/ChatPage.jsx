import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Sidebar,
  Search,
  ConversationList,
  Conversation,
  Avatar,
  ConversationHeader,
  EllipsisButton,
  MessageSeparator,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import User from "../context/User";
import { useCallback, useContext, useEffect, useState } from "react";
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
} from "../config/firebase";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";

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

  const [searchParams, setSearchParams] = useSearchParams();
  const chatIdParam = searchParams.get("chatId");
  const navigate = useNavigate();

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

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("email", "!=", user.email)
        );
        onSnapshot(q, (querySnapshot) => {
          const users = [];
          querySnapshot.forEach((doc) => {
            const user = { ...doc.data(), id: doc.id };
            user.username = capitalizeWords(user.username || "");
            users.push(user);
          });
          // const name = users.doc.data().username

          setChats(users);
          setCurrentChat(users[0]);
          console.log("Current users in CA: ", users);
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getAllUsers();
  }, [user.email]);

  const onSend = async () => {
    setMessageInputValue("");
    await addDoc(collection(db, "messages"), {
      message: messageInputValue,
      sentTime: new Date().toISOString(),
      sender: user.uid,
      receiver: currentChat.uid,
      senderName: user.username,
      receiverName: currentChat.username,
      // chatId: chatId(),
      timeStamp: serverTimestamp(),
    });
    // await updateDoc(doc(db, "users", currentChat.uid), {
    //     [`lastMessages.${chatId(currentChat.uid)}`]: {
    //         lastMessage: messageInputValue,
    //         chatId: chatId(currentChat.uid)
    //     }
    // });
    // await updateDoc(doc(db, "users", user.uid), {
    //     [`lastMessages.${chatId(currentChat.uid)}`]: {
    //         lastMessage: messageInputValue,
    //         chatId: chatId(currentChat.uid)
    //     }
    // });
  };

  return (
    <MainContainer
      responsive
      style={{
        height: "100vh",
      }}
    >
      <Sidebar style={sidebarStyle} position="left">
        <ConversationHeader style={{ paddingBottom: 13 }}>
          <Avatar
            style={{ cursor: "pointer" }}
            name={user.username}
            src={
              // user.photo || user.photo !== null
              // ? user.photo:
              `https://ui-avatars.com/api/?name=${user.username}&background=random`
            }
            // onClick={myProfile}
          />
          <ConversationHeader.Content userName={user.username} />
          <ConversationHeader.Actions>
            <LogoutOutlined onClick={logOut} style={{ fontSize: 22 }} />
          </ConversationHeader.Actions>
        </ConversationHeader>
        <Search placeholder="Search..." />
        <ConversationList>
          {chats.map((v) => (
            <Conversation
              style={{
                backgroundColor:
                  searchParams.get("chatId") === v.id ? "#c6e3fa" : "",
              }}
              key={v.id}
              onClick={() => {
                handleConversationClick();
                setCurrentChat(v);
                // searchParams.set("chatId", v.id);
                // navigate(`/chatapp?${searchParams}`);
              }}
            >
              <Conversation.Content
                info="Yes i can do it for you"
                name={v?.username}
                style={conversationContentStyle}
              />
              <Avatar
                name={v?.username}
                src={`https://ui-avatars.com/api/?name=${v?.username}&background=random`}
                status="available"
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
            src={`https://ui-avatars.com/api/?name=${currentChat?.username}&background=random`}
            name={currentChat?.username}
          />
          <ConversationHeader.Content
            userName={currentChat?.username}
            info="Active 10 mins ago"
          />

          <ConversationHeader.Actions>
            <EllipsisButton orientation="vertical" />
          </ConversationHeader.Actions>
        </ConversationHeader>
        <MessageList
          typingIndicator={<TypingIndicator content="Zoe is typing" />}
        >
          <MessageSeparator content="Saturday, 30 November 2019" />
          <Message
            model={{
              direction: "incoming",
              message: "Hello my friend",
              position: "single",
              sender: "Zoe",
              sentTime: "15 mins ago",
            }}
          >
            <Avatar
              name={currentChat?.username}
              src={`https://ui-avatars.com/api/?name=${currentChat?.username}&background=random`}
            />
          </Message>
          <Message
            // avatarSpacer
            model={{
              direction: "outgoing",
              message: "Hello my friend",
              position: "single",
              sender: "Patrik",
              sentTime: "15 mins ago",
            }}
          >
            <Avatar
              name={user?.username}
              src={`https://ui-avatars.com/api/?name=${user?.username}&background=random`}
            />
          </Message>
        </MessageList>
        <MessageInput
          placeholder="Type message here"
          value={messageInputValue}
          onChange={(val) => setMessageInputValue(val)}
          onSend={onSend}
        />
      </ChatContainer>
    </MainContainer>
  );
};
