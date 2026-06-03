import { useContext, useEffect, useState } from "react";
import { ChatContext } from "./context/ChatContext";
import { ServerList } from "./components/ServerList";
import { Sidebar } from "./components/SideBar";
import { ChatArea } from "./components/ChatArea";
import { MembersPanel } from "./components/MembersPanel";
import { NameScreen } from "./components/NameScreen";
import { CreateServerModal } from "./components/CreateServerModal";
import { useWebSocket } from "./hooks/useWebSocket";
import { Server, Channel } from "./types";

export function App() {
  const ctx = useContext(ChatContext)!;
  const {
    nameSet,
    members,
    currentChannel,
    currentServer,
    name,
    dispatch,
    socketRef,
  } = ctx;

  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showCreateServer, setShowCreateServer] = useState(false);

  // deleting old useEffect tracking members from messages
  // members now comes directly from context

  useWebSocket();

  // fetch all servers on mount
  useEffect(() => {
    fetch("http://localhost:8080/api/serverse")
      .then((r) => r.json())
      .then(setServers);
  }, []);

  // fetch channels when server changes
  useEffect(() => {
    if (!currentServer) return;
    fetch(`http://localhost:8080/api/servers/${currentServer.id}/channels`)
      .then((r) => r.json())
      .then(setChannels);
  }, [currentServer]);

  // add yourself to members when you join a room
  // useEffect(() => {
  //   if (currentRoom && name) {
  //     dispatch({ type: "ADD_MEMBER", payload: name });
  //   }
  // }, [currentRoom, name, dispatch]);

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
