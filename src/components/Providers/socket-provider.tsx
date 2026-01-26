"use client";

import { useEffect } from "react";

export const HeartbeatProvider = () => {
  useEffect(() => {
    // Heartbeat function jo API ko call karegi
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/user/heartbeat", { method: "POST" });
      } catch (error) {
        console.error("Heartbeat failed", error);
      }
    };

    // Pehli baar foran call karein
    sendHeartbeat();

    // Phir har 30 seconds baad call karein
    const interval = setInterval(sendHeartbeat, 30000);

    // Jab component khatam ho, toh interval saaf kar dein
    return () => clearInterval(interval);
  }, []);

  return null; // Ye component kuch dikhaye ga nahi, sirf background mein kaam karega
};