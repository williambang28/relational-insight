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

const ChatSwitcher = () => {
  const [useLLM, setUseLLM] = useState(false);
  const [messages, setMessages] = useState([
    {
      props: {
        model: {
          message: "Hello! What's on your mind?",
          sender: "Relational Insight",
          direction: "incoming",
          position: "single",
        },
      },
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      props: {
        model: {
          message,
          sender: "User",
          direction: "outgoing",
          position: "single",
        },
      },
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch(useLLM ? "/api/LLM" : "/api/ruleBased", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ content: message }],
          prompt: message, // LLM needs `prompt`, ruleBased might just use `messages`
        }),
      });

      const data = await response.json();

      const botMessage = {
        props: {
          model: {
            message: data.message || data.response || "No response.",
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
            message: `Sorry, something went wrong. Error: ${error}`,
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
      <div style={{ padding: "0.5rem" }}>
        <label>
          <input
            type="checkbox"
            checked={useLLM}
            onChange={() => {
              setUseLLM((prev) => !prev);
              setMessages([
                {
                  props: {
                    model: {
                      message: "Hello! What's on your mind?",
                      sender: "Relational Insight",
                      direction: "incoming",
                      position: "single",
                    },
                  },
                },
              ]);
            }}
            style={{ marginRight: "0.5rem" }}
          />
          {useLLM ? "Using LLM" : "Using Rule-Based"}
        </label>
      </div>

      <MainContainer>
        <ChatContainer>
          <MessageList
            style={{ height: "500px" }}
            typingIndicator={
              isTyping && <TypingIndicator content="Thinking..." />
            }
          >
            {messages.map((m, i) => (
              // @ts-ignore
              <Message key={i} {...m.props} />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            attachButton={false}
            onSend={handleSend}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatSwitcher;
