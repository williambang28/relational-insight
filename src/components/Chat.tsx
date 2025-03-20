"use client";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";

const Chat = () => {
    return <div style={{ position: "relative", height: "500px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            <Message
              model={{
                message: "Hello my friend",
                sentTime: "just now",
                sender: "Joe",
                direction: "incoming",
                position: "single",
              }}
            />
          </MessageList>
          <MessageInput placeholder="Type message here" attachButton={false}/>
        </ChatContainer>
      </MainContainer>
    </div>;
};

export default Chat;
