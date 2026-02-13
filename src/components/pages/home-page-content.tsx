"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";

export default function HomePageContent() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  return (
    <div className="mx-auto flex-1 w-full max-w-6xl px-6 py-8">
      <div className="relative h-full">
        <Sidebar
          selectedGroups={selectedGroups}
          onSelectionChange={setSelectedGroups}
        />
        <main className="ml-72">
          <h1 className="text-2xl font-semibold tracking-tight">Bosh sahifa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bu yerga asosiy kontent joylanadi.
          </p>
        </main>
      </div>
    </div>
  );
}
