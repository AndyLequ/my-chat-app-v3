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

  // track members
  useEffect(() => {
    if (currentChannel && name) {
      dispatch({ type: "ADD_MEMBER", payload: name });
    }
  }, [currentChannel, name, dispatch]);

  useEffect(() => {
    if (!currentChannel) {
      dispatch({ type: "SET_MEMBER_LIST", payload: [] });
    }
  }, [currentChannel, dispatch]);

  if (!nameSet) return <NameScreen />;

  return (
    <div className="w-full h-full flex rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl">
      <Sidebar />
      <ChatArea members={members} />
      <MembersPanel members={members} />
    </div>
  );
}
