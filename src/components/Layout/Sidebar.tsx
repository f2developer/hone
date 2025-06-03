import React from 'react';
import { X, Plus, MessageSquare, Settings, HelpCircle } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <button 
          className={styles.closeButton} 
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      </div>

      <div className={styles.sidebarContent}>
        <button className={styles.newChatButton}>
          <Plus size={20} />
          <span>New chat</span>
        </button>

        <div className={styles.recentChats}>
          <h3>Recent chats</h3>
          <div className={styles.chatItem}>
            <MessageSquare size={16} />
            <span>Understanding quantum computing</span>
          </div>
          <div className={styles.chatItem}>
            <MessageSquare size={16} />
            <span>Creative writing prompts</span>
          </div>
          <div className={styles.chatItem}>
            <MessageSquare size={16} />
            <span>How to make pasta from scratch</span>
          </div>
        </div>
      </div>

      <div className={styles.sidebarFooter}>
        <button className={styles.footerButton}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className={styles.footerButton}>
          <HelpCircle size={20} />
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;