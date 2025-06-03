import { useState, useCallback, useEffect } from 'react';
import { Message, ChatSession } from '../types';

/**
 * Custom hook for managing chat functionality
 * @returns Chat-related state and functions
 */
export const useChat = () => {
  // Current active chat session
  const [activeChat, setActiveChat] = useState<ChatSession>({
    id: 'default',
    title: 'New Chat',
    messages: [],
    createdAt: new Date(),
  });

  // List of all chat sessions
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  
  // Loading state for AI responses
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      const savedActive = localStorage.getItem('activeChat');
      
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
      
      if (savedActive) {
        setActiveChat(JSON.parse(savedActive));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Failed to load chat history');
    }
  }, []);

  // Save chat data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      localStorage.setItem('activeChat', JSON.stringify(activeChat));
    } catch (err) {
      console.error('Failed to save chat data:', err);
      setError('Failed to save chat data');
    }
  }, [chatHistory, activeChat]);

  /**
   * Adds a new message to the active chat
   * @param content Message content
   * @param isUser Whether the message is from the user
   */
  const addMessage = useCallback((content: string, isUser: boolean) => {
    if (!content.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    };

    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    // Update chat history
    setChatHistory(prev => {
      const existingChatIndex = prev.findIndex(chat => chat.id === activeChat.id);
      if (existingChatIndex >= 0) {
        const updatedHistory = [...prev];
        updatedHistory[existingChatIndex] = {
          ...prev[existingChatIndex],
          messages: [...prev[existingChatIndex].messages, newMessage],
        };
        return updatedHistory;
      } else {
        return [...prev, activeChat];
      }
    });

    return newMessage;
  }, [activeChat]);

  /**
   * Sends a user message and gets an AI response
   * @param userMessage The message from the user
   */
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    // Add user message
    addMessage(userMessage, true);
    
    // Simulate AI response
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponses = [
        "আমি আপনাকে কিভাবে সাহায্য করতে পারি?",
        "আপনার প্রশ্ন আমি বুঝতে পারছি।",
        "এই বিষয়ে আরও তথ্য দিন।",
        "আপনার জন্য আমি এখানে আছি।",
        "অন্য কোনো প্রশ্ন আছে কি?",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      addMessage(randomResponse, false);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError('Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  /**
   * Creates a new chat session
   */
  const createNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    
    setActiveChat(newChat);
    setChatHistory(prev => [...prev, newChat]);
  }, []);

  /**
   * Switches to a different chat session
   * @param chatId ID of the chat to switch to
   */
  const switchChat = useCallback((chatId: string) => {
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setActiveChat(selectedChat);
    }
  }, [chatHistory]);

  return {
    activeChat,
    chatHistory,
    isLoading,
    error,
    sendMessage,
    createNewChat,
    switchChat,
  };
};