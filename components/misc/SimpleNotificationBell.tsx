import React from "react";
import { Bell } from "lucide-react";

const SimpleNotificationBell = ({ count = 0 }) => (
  <div className="relative">
    <Bell className="h-6 w-6" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex justify-center items-center border border-white ">
        {count > 99 ? "99+" : count}
      </span>
    )}
  </div>
);

export default SimpleNotificationBell;
