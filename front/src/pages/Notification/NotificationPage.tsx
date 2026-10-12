// src/pages/NotificationPage.tsx
import React from 'react';
import Notifications from '../../components/notifications/Notifications';

const NotificationPage: React.FC = () => {
      //const { toggleTheme } = useTheme();
    
  return (
    <div className="mx-auto max-w-full pt-1 p-4 md:pt-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 mt-0 pt-0">
       
      </div>

      {/* Notifications Component */}
      {/*<Notifications children={undefined} />*/}
      <Notifications  />
    </div>
  );
};

export default NotificationPage;
