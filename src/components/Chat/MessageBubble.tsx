import React from 'react';
import { Message } from './ChatInterface';
import { User } from 'lucide-react';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isFirstInGroup }) => {
  return (
    <div className={`${styles.messageBubble} ${styles[message.sender]}`}>
      {isFirstInGroup && message.sender === 'ai' && (
        <div className={styles.avatar}>
          <div className={styles.geminiAvatar}>H1</div>
        </div>
      )}
      
      {isFirstInGroup && message.sender === 'user' && (
        <div className={styles.avatar}>
          <div className={styles.userAvatar}>
            <User size={16} />
          </div>
        </div>
      )}
      
      <div className={styles.messageContent}>
        <div className={styles.messageText}>{message.content}</div>
      </div>
    </div>
  );
};

export default MessageBubble;