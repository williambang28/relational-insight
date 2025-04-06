"use client";

import { useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      props: {
        model: {
          message: "Hello! How can I assist you today?",
          sender: "Relational Insight",
          direction: "incoming",
          position: "single",
        },
      },
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message: String) => {

    if (!message.trim()) return;

    const userMessage = {
      props: {
        model: {
          message: String(message),
          sender: "User",
          direction: "outgoing",
          position: "single",
        },
      },
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send user message to the backend for processing
      const response = await fetch("/api/ruleBasedAI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          messages: [{ content: message }],
        }),
      });

      const data = await response.json();

      const botMessage = {
        props: {
          model: {
            message: data.message,
            sender: "Relational Insight",
            direction: "incoming",
            position: "single",
          },
        },
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        props: {
          model: {
            message: `Sorry, something went wrong. error: ${error}`,
            sender: "Relational Insight",
            direction: "incoming",
            position: "single",
          },
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList style={{ height: "500px" }} typingIndicator={isTyping && <TypingIndicator content="Thinking..." />}>
            {messages.map((m, i) => (
              // @ts-ignore
              <Message key={i} {...m.props} />
            ))}
          </MessageList>
          <MessageInput placeholder="Type message here" attachButton={false} onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;