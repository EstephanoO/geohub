"use client";

import MapWithSidebar from "@/app/components/map/MapWithSidebar";

export default function Home() {
  return (
    <div className="h-screen w-full">
      <MapWithSidebar showAdminControls={false} />
    </div>
  );
}