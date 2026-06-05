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

  async function handleJoinServer(server: Server) {
    dispatch({ type: "SET_SERVER", payload: server });
    dispatch({ type: "SET_CHANNEL", payload: null });

    // register membership
    await fetch(`http://localhost:8080/api/servers/${server.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: name }),
    });
  }

  async function handleCreateServer(serverName: string, description: string) {
    const res = await fetch("http://localhost:8080/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: serverName, description }),
    });
    const newServer = await res.json();
    setServers((prev) => [...prev, newServer]);
    setShowCreateServer(false);
    handleJoinServer(newServer);
  }

  function handleJoinChannel(channel: Channel) {
    if (currentChannel) {
      socketRef.current?.send(
        JSON.stringify({
          type: "leave-channel",
          name,
          channelId: currentChannel.id,
        }),
      );
    }

    dispatch({ type: "SET_CHANNEL", payload: channel });
    socketRef.current?.send(
      JSON.stringify({
        type: "join-channel",
        name,
        channelId: channel.id,
        serverId: currentServer?.id,
      }),
    );
  }

  if (!nameSet) return <NameScreen />;

  return (
    <>
      <div className="w-full h-full flex rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl">
        <ServerList
          servers={servers}
          onJoinServer={handleJoinServer}
          onCreateServer={() => setShowCreateServer(true)}
        />
        <Sidebar
          channels={channels}
          currentChannel={currentChannel}
          onJoinChannel={handleJoinChannel}
        />
        <ChatArea members={members} />
        <MembersPanel members={members} />
      </div>

      {showCreateServer && (
        <CreateServerModal
          onClose={() => setShowCreateServer(false)}
          onCreate={handleCreateServer}
        />
      )}
    </>
  );
}
