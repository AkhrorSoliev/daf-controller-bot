"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface TelegramGroup {
  id: number;
  title: string;
  type: string;
  addedAt: string;
}

interface SidebarProps {
  selectedGroups: string[];
  onSelectionChange: (groupIds: string[]) => void;
}

export default function Sidebar({
  selectedGroups,
  onSelectionChange,
}: SidebarProps) {
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/groups`);
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups);
      } else {
        setError("Guruhlarni yuklashda xatolik");
      }
    } catch {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onSelectionChange(selectedGroups.filter((id) => id !== groupId));
    } else {
      onSelectionChange([...selectedGroups, groupId]);
    }
  };

  const selectAll = () => {
    if (selectedGroups.length === groups.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(groups.map((g) => g.id.toString()));
    }
  };

  return (
    <aside className="pointer-events-none fixed left-1/2 top-16 bottom-14 w-full max-w-6xl -translate-x-1/2 px-6">
      <div className="pointer-events-auto h-full w-64 overflow-y-auto rounded-xl border border-border/60 bg-background/95 p-4 shadow-sm">
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border/60 bg-background/95 px-4 pb-3 pt-1 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Telegram guruhlar
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchGroups}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Yangilash"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                {groups.length}
              </span>
            </div>
          </div>
          {groups.length > 0 && (
            <button
              onClick={selectAll}
              className="mt-2 text-xs text-primary hover:underline cursor-pointer"
            >
              {selectedGroups.length === groups.length
                ? "Barchasini bekor qilish"
                : "Barchasini tanlash"}
            </button>
          )}
        </div>

        {loading && groups.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <button
              onClick={fetchGroups}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Qayta urinish
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Guruhlar topilmadi</p>
            <p className="text-xs mt-1">
              Botni guruhga qo'shing va admin qiling
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {groups.map((group) => {
              const isSelected = selectedGroups.includes(group.id.toString());
              return (
                <li
                  key={group.id}
                  onClick={() => toggleGroup(group.id.toString())}
                  className={`rounded-md px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "hover:bg-accent/60"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="truncate">{group.title}</span>
                </li>
              );
            })}
          </ul>
        )}

        {selectedGroups.length > 0 && (
          <div className="sticky bottom-0 -mx-4 mt-4 border-t border-border/60 bg-background/95 px-4 pt-3 backdrop-blur">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {selectedGroups.length}
              </span>{" "}
              guruh tanlandi
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
