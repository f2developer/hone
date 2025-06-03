import React, { useState } from 'react';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import styles from './ChatInterface.module.css';
import { queryBackend } from '../../api';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'হ্যালো! আমি কীভাবে সাহায্য করতে পারি?',
      sender: 'ai',
      timestamp: Date.now()
    }
  ]);

  const buildContext = () => {
    const history = messages
      .map((msg) =>
        msg.sender === 'user'
          ? `প্রশ্ন: ${msg.content}`
          : `উত্তর: ${msg.content}`
      )
      .join('\n');

    const backgroundInfo = `
বাংলাদেশ একটি দক্ষিণ এশিয়ার দেশ, যার রাজধানী ঢাকা।
বাংলাদেশের স্বাধীনতা যুদ্ধ ১৯৭১ সালে সংঘটিত হয়।
এই দেশের প্রধান নদী পদ্মা, যমুনা ও মেঘনা।
বাংলাদেশ একটি কৃষিনির্ভর দেশ।
    `.trim();

    return `${backgroundInfo}\n${history}`;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Bachelor ...',
      sender: 'ai',
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const context = buildContext();
      const response = await queryBackend(content, context);

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: response.answer.trim(),
        sender: 'ai',
        timestamp: Date.now()
      };

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // remove loading
        return [...updated, aiMessage];
      });
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        content: 'AI উত্তর দিতে ব্যর্থ হয়েছে।',
        sender: 'ai',
        timestamp: Date.now()
      };

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop();
        return [...updated, errorMessage];
      });
    }
  };

  return (
    <div className={styles.chatContainer}>
      <ChatHistory messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatInterface;
