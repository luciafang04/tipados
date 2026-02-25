"use client";

import { useEffect } from "react";

export function CursorLight() {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.className = "light-cursor";
    document.body.appendChild(cursor);

    const handleMouseMove = (event: MouseEvent): void => {
      cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cursor.remove();
    };
  }, []);

  return null;
}
