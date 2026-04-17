package main

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB(dsn string) {
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("failed to open db:", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	createTables()
	log.Println("Database connected and tables initialized")
}

func createTables() {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS rooms (
			id SERIAL PRIMARY KEY,
			name TEXT,
			is_dm BOOLEAN NOT NULL DEFAULT FALSE,
			creator_username TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS room_members (
			room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
			username TEXT NOT NULL,
			joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			PRIMARY KEY (room_id, username)
		)`,
		`CREATE TABLE IF NOT EXISTS messages (
			id SERIAL PRIMARY KEY,
			room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
			sender_username TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS room_last_read (
			room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
			username TEXT NOT NULL,
			last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			PRIMARY KEY (room_id, username)
		)`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			log.Fatal("failed to create table:", err)
		}
	}
}
