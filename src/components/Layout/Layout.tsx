import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatInterface from '../Chat/ChatInterface';
import styles from './Layout.module.css';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.layoutContainer}>
      <Header toggleSidebar={toggleSidebar} />
      <div className={styles.mainContent}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <main 
          className={`${styles.content} ${isSidebarOpen ? styles.contentWithSidebar : ''}`}
          onClick={isSidebarOpen ? closeSidebar : undefined}
        >
          <ChatInterface />
        </main>
      </div>
    </div>
  );
};

export default Layout;