import { pgTable, serial, varchar, text, timestamp, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	text: text().notNull(),
	room: varchar({ length: 100 }).notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("rooms_name_unique").on(table.name),
]);
