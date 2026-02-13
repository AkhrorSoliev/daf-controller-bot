"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://daf-controller-bot-production.up.railway.app";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpenId, setConfirmOpenId] = useState<string | null>(null);

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

  const deleteGroup = async (groupId: string) => {
    setDeletingId(groupId);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Guruhni o'chirishda xatolik");
        return;
      }
      setGroups((prev) => prev.filter((g) => g.id.toString() !== groupId));
      if (selectedGroups.includes(groupId)) {
        onSelectionChange(selectedGroups.filter((id) => id !== groupId));
      }
    } catch {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setDeletingId(null);
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
                  <Popover
                    open={confirmOpenId === group.id.toString()}
                    onOpenChange={(open) =>
                      setConfirmOpenId(
                        open ? group.id.toString() : null
                      )
                    }
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        disabled={deletingId === group.id.toString()}
                        className="ml-auto p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        title="Guruhni o'chirish"
                        aria-label="Guruhni o'chirish"
                      >
                        <Trash2
                          className={`w-3.5 h-3.5 ${
                            deletingId === group.id.toString()
                              ? "opacity-60"
                              : ""
                          }`}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-48"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-sm font-medium">
                        Guruhni o'chiraymi?
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmOpenId(null)}
                        >
                          Yo'q
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setConfirmOpenId(null);
                            deleteGroup(group.id.toString());
                          }}
                        >
                          Ha
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
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
