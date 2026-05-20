import { useContext, useEffect, useState } from "react";
import { ChatContext } from "./context/ChatContext";
import { Sidebar } from "./components/SideBar";
import { ChatArea } from "./components/ChatArea";
import { MembersPanel } from "./components/MembersPanel";
import { NameScreen } from "./components/NameScreen";
import { useWebSocket } from "./hooks/useWebSocket";

export function App() {
  const ctx = useContext(ChatContext)!;
  const { nameSet, messages, currentRoom, name } = ctx;
  const [members, setMembers] = useState<string[]>([]);

  useWebSocket();

  useEffect(() => {
    const names = new Set<string>();
    messages.forEach((m) => {
      if (m.type === "join") names.add(m.name);
      if (m.type === "leave") names.delete(m.name);
    });
    if (currentRoom && name) names.add(name);
    setMembers([...names]);
  }, [messages, currentRoom, name]);

  if (!nameSet) return <NameScreen />;

  return (
    <div className="w-full h-full flex rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl">
      <Sidebar />
      <ChatArea members={members} />
      <MembersPanel members={members} />
    </div>
  );
}
