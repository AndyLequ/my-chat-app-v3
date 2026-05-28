import { useContext, useEffect } from "react";
import { ChatContext } from "./context/ChatContext";
import { Sidebar } from "./components/SideBar";
import { ChatArea } from "./components/ChatArea";
import { MembersPanel } from "./components/MembersPanel";
import { NameScreen } from "./components/NameScreen";
import { useWebSocket } from "./hooks/useWebSocket";

export function App() {
  const ctx = useContext(ChatContext)!;
  const { nameSet, members, currentRoom, name, dispatch } = ctx;

  // deleting old useEffect tracking members from messages
  // members now comes directly from context

  useWebSocket();

  // add yourself to members when you join a room
  useEffect(() => {
    if (currentRoom && name) {
      dispatch({ type: "ADD_MEMBER", payload: name });
    }
  }, [currentRoom, name, dispatch]);

  useEffect(() => {
    if (!currentRoom) {
      dispatch({ type: "SET_MEMBER_LIST", payload: [] });
    }
  }, [currentRoom, dispatch]);

  if (!nameSet) return <NameScreen />;

  return (
    <div className="w-full h-full flex rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl">
      <Sidebar />
      <ChatArea members={members} />
      <MembersPanel members={members} />
    </div>
  );
}
