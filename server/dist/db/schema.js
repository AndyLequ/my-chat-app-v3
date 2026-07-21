"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.serverMembers = exports.messages = exports.channels = exports.servers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.servers = (0, pg_core_1.pgTable)("servers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.channels = (0, pg_core_1.pgTable)("channels", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    serverId: (0, pg_core_1.integer)("server_id")
        .references(() => exports.servers.id)
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    text: (0, pg_core_1.text)("text").notNull(),
    channelId: (0, pg_core_1.integer)("channel_id")
        .references(() => exports.channels.id)
        .notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
});
exports.serverMembers = (0, pg_core_1.pgTable)("server_members", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    serverId: (0, pg_core_1.integer)("server_id")
        .references(() => exports.servers.id)
        .notNull(),
    userName: (0, pg_core_1.varchar)("user_name", { length: 100 }).notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow().notNull(),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.varchar)("username", { length: 100 }).notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
