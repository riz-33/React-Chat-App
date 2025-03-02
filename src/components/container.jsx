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
import { useContext, useEffect, useState } from "react";
import {
  db,
  getDocs,
  collection,
  auth,
  signOut,
  query,
  where,
  onSnapshot,
} from "../config/firebase";

const capitalizeWords = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const Container = () => {
  const user = useContext(User).user;
  user.username = capitalizeWords(user.username || "");
  const logOut = () => signOut(auth);
  const [chats, setChats] = useState([]);

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
          console.log("Current users in CA: ", users);
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getAllUsers();
  }, [user.email]);

  return (
    <MainContainer
      responsive
      style={{
        height: "100vh",
      }}
    >
      <Sidebar position="left">
        <Search placeholder="Search..." />
        <ConversationList>
          {chats.map((v) => (
            <Conversation
              key={v.id}
              info="Yes i can do it for you"
              name={v?.username}
            >
              <Avatar
                name={v?.username}
                src={`https://ui-avatars.com/api/?name=${v?.username}&background=random`}
                status="available"
              />
            </Conversation>
          ))}
        </ConversationList>
      </Sidebar>
      <ChatContainer>
        <ConversationHeader>
          <ConversationHeader.Back />
          <Avatar
            name="Zoe"
            src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
          />
          <ConversationHeader.Content
            info="Active 10 mins ago"
            userName="Zoe"
          />
          <ConversationHeader.Actions>
            <EllipsisButton onClick={logOut} orientation="vertical" />
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
              name="Zoe"
              src="https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
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
        <MessageInput placeholder="Type message here" />
      </ChatContainer>
    </MainContainer>
  );
};
