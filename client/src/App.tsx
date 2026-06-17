import { useContext, useEffect, useState } from "react";
import { ChatContext } from "./context/ChatContext";
import { ServerList } from "./components/ServerList";
import { Sidebar } from "./components/SideBar";
import { ChatArea } from "./components/ChatArea";
import { MembersPanel } from "./components/MembersPanel";
import { NameScreen } from "./components/NameScreen";
import { CreateServerModal } from "./components/CreateServerModal";
import { useWebSocket } from "./hooks/useWebSocket";
import type { Server, Channel } from "./types";
import { BrowseServersModal } from "./components/BrowseServersModal";

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
  const [showBrowseServers, setShowBrowseServers] = useState(false);

  // deleting old useEffect tracking members from messages
  // members now comes directly from context

  useWebSocket();

  // fetch servers the user has joined (instead of ALL servers)
  useEffect(() => {
    if (!name) return;
    fetch(`http://localhost:8080/api/users/${name}/servers`)
      .then((r) => r.json())
      .then(setServers);
  }, [name]);

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

  useEffect(() => {
    if (
      !currentChannel ||
      !currentServer ||
      !name ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "join-channel",
        name,
        channelId: currentChannel.id,
        serverId: currentServer.id,
      }),
    );
  }, [currentChannel, currentServer, name, socketRef]);

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

  async function handleBrowseJoin(server: Server) {
    await fetch(`http://localhost:8080/api/servers/${server.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: name }),
    });
    setServers((prev) => [...prev, server]);
    setShowBrowseServers(false);
    handleJoinServer(server);
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
    if (currentChannel?.id === channel.id) return;

    dispatch({ type: "CLEAR_MESSAGES" });
    dispatch({ type: "SET_CHANNEL", payload: channel });
  }

  if (!nameSet) return <NameScreen />;

  return (
    <>
      <div className="w-full h-full flex rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl">
        <ServerList
          servers={servers}
          onJoinServer={handleJoinServer}
          onCreateServer={() => setShowCreateServer(true)}
          onBrowseServers={() => setShowBrowseServers(true)}
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
      {showBrowseServers && (
        <BrowseServersModal
          onClose={() => setShowBrowseServers(false)}
          onJoin={handleBrowseJoin}
          myServerIds={servers.map((s) => s.id)}
        />
      )}
    </>
  );
}
