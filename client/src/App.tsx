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
import { DeleteServerModal } from "./components/DeleteServerModal";

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
  const [createServerError, setCreateServerError] = useState<string | null>(
    null,
  );
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);

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

  useEffect(() => {
    if (!currentServer) {
      dispatch({ type: "SET_MEMBER_LIST", payload: [] });
    }
  }, [currentServer, dispatch]);

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
    // leave previous server presence
    if (currentServer) {
      socketRef.current?.send(
        JSON.stringify({
          type: "leave-server",
          name,
          serverId: currentServer.id,
        }),
      );
    }

    setChannels([]); // clear channels immediately while new ones load
    dispatch({ type: "SET_SERVER", payload: server });
    dispatch({ type: "SET_CHANNEL", payload: null });
    dispatch({ type: "SET_MEMBER_LIST", payload: [] }); // clear while loading

    // announce presence to the new server
    socketRef.current?.send(
      JSON.stringify({
        type: "join-server",
        name,
        serverId: server.id,
      }),
    );

    //adding self to members in server
    dispatch({ type: "ADD_MEMBER", payload: name });

    // register membership in DB
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

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error };
    }

    setServers((prev) => [...prev, data]);
    setShowCreateServer(false);
    handleJoinServer(data);
    return {};
  }

  async function handleDeleteServer(serverId: number) {
    const res = await fetch(`http://localhost:8080/api/servers/${serverId}`, {
      method: "DELETE",
    });

    if (!res.ok) return;

    // remove from local list
    setServers((prev) => prev.filter((s) => s.id !== serverId));

    // if currently viewing this server, clear it
    if (currentServer?.id === serverId) {
      setChannels([]);
      dispatch({ type: "SET_SERVER", payload: null });
      dispatch({ type: "SET_CHANNEL", payload: null });
      dispatch({ type: "SET_MEMBER_LIST", payload: [] });
      dispatch({ type: "CLEAR_MESSAGES" });
    }
  }

  function handleJoinChannel(channel: Channel) {
    if (!currentServer) return;

    if (currentChannel?.id === channel.id) return;

    if (currentChannel) {
      socketRef.current?.send(
        JSON.stringify({
          type: "leave-channel",
          name,
          channelId: currentChannel.id,
        }),
      );
    }

    dispatch({ type: "CLEAR_MESSAGES" });
    dispatch({ type: "SET_CHANNEL", payload: channel });

    socketRef.current?.send(
      JSON.stringify({
        type: "join-channel",
        name,
        channelId: channel.id,
        serverId: currentServer.id,
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
          onBrowseServers={() => setShowBrowseServers(true)}
          onDeleteServer={(server) => setServerToDelete(server)}
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
          onClose={() => {
            setShowCreateServer(false);
            setCreateServerError(null);
          }}
          onCreate={handleCreateServer}
          error={createServerError}
        />
      )}
      {showBrowseServers && (
        <BrowseServersModal
          onClose={() => setShowBrowseServers(false)}
          onJoin={handleBrowseJoin}
          myServerIds={servers.map((s) => s.id)}
        />
      )}
      {serverToDelete && (
        <DeleteServerModal
          serverName={serverToDelete.name}
          onCancel={() => setServerToDelete(null)}
          onConfirm={() => {
            handleDeleteServer(serverToDelete.id);
            setServerToDelete(null);
          }}
        />
      )}
    </>
  );
}
