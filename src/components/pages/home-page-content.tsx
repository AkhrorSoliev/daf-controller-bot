"use client";

import { useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/sidebar";
import TiptapEditor from "@/components/tiptap-editor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function HomePageContent() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (html: string, mediaFiles?: File[]) => {
    if (selectedGroups.length === 0) {
      toast.error("Kamida bitta guruh tanlang");
      return;
    }

    const hasMedia = mediaFiles && mediaFiles.length > 0;
    if (!html || html === "<p></p>") {
      if (!hasMedia) {
        toast.error("Xabar bo'sh");
        return;
      }
    }

    setSending(true);

    try {
      let data;

      if (hasMedia) {
        // Media fayllar bilan yuborish
        const formData = new FormData();
        mediaFiles.forEach((file) => formData.append("media", file));
        formData.append("groupIds", JSON.stringify(selectedGroups));
        formData.append("caption", html);

        const res = await fetch(`${API_URL}/api/send-media-files`, {
          method: "POST",
          body: formData,
        });
        data = await res.json();
      } else {
        // Faqat matn yuborish
        const res = await fetch(`${API_URL}/api/send-message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupIds: selectedGroups, message: html }),
        });
        data = await res.json();
      }

      if (data.success) {
        toast.success("Muvaffaqiyatli yuborildi");
        localStorage.removeItem("tiptap-editor-content");
      } else {
        toast.error(data.error || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Serverga ulanib bo'lmadi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex-1 w-full max-w-6xl px-6 py-8">
      <div className="relative h-full">
        <Sidebar
          selectedGroups={selectedGroups}
          onSelectionChange={setSelectedGroups}
        />
        <main className="ml-72 space-y-4">
          <TiptapEditor
            onSubmit={handleSubmit}
            disabled={sending}
            submitLabel={
              sending
                ? "Yuborilmoqda..."
                : `Jo'natish (${selectedGroups.length})`
            }
          />
        </main>
      </div>
    </div>
  );
}
