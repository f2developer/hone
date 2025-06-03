import React, { useRef, useEffect } from 'react';
import { Message } from './ChatInterface';
import MessageBubble from './MessageBubble';
import styles from './ChatHistory.module.css';

interface ChatHistoryProps {
  messages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group consecutive AI messages together
  const groupedMessages = messages.reduce<Message[][]>((acc, message, index) => {
    if (index === 0 || message.sender !== messages[index - 1].sender) {
      acc.push([message]);
    } else {
      acc[acc.length - 1].push(message);
    }
    return acc;
  }, []);

  return (
    <div className={styles.chatHistory}>
      {groupedMessages.map((group, groupIndex) => (
        <div 
          key={`group-${groupIndex}`} 
          className={`${styles.messageGroup} ${styles[group[0].sender + 'Group']}`}
        >
          {group.map((message, messageIndex) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isFirstInGroup={messageIndex === 0}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatHistory;