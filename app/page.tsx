"use client";

import MapWithSidebar from "@/src/components/MapWithSidebar";

export default function Home() {
  return (
    <div className="h-screen w-full">
      <MapWithSidebar showAdminControls={false} />
    </div>
  );
}