package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

func registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/rooms", createRoom)
	mux.HandleFunc("POST /api/rooms/dm", createDMRoom)
	mux.HandleFunc("POST /api/rooms/{id}/members", addMember)
	mux.HandleFunc("POST /api/rooms/{id}/messages", sendMessage)
	mux.HandleFunc("DELETE /api/rooms/{id}", deleteRoom)
	mux.HandleFunc("GET /api/rooms", getRooms)
	mux.HandleFunc("GET /api/unreads", getUnreads)
	mux.HandleFunc("DELETE /api/rooms/{id}/unreads", clearUnreads)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func createRoom(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-Username")
	if username == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	var room struct {
		ID              int       `json:"id"`
		Name            string    `json:"name"`
		IsDM            bool      `json:"isDm"`
		CreatorUsername string    `json:"creatorUsername"`
		CreatedAt       time.Time `json:"createdAt"`
	}
	err := db.QueryRow(
		`INSERT INTO rooms (name, is_dm, creator_username) VALUES ($1, false, $2)
		 RETURNING id, name, is_dm, creator_username, created_at`,
		body.Name, username,
	).Scan(&room.ID, &room.Name, &room.IsDM, &room.CreatorUsername, &room.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create room")
		return
	}
	db.Exec(`INSERT INTO room_members (room_id, username) VALUES ($1, $2)`, room.ID, username)
	writeJSON(w, http.StatusCreated, room)
}

func createDMRoom(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-Username")
	if username == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	var body struct {
		OtherUsername string `json:"other_username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.OtherUsername == "" {
		writeError(w, http.StatusBadRequest, "other_username is required")
		return
	}
	var room struct {
		ID              int       `json:"id"`
		IsDM            bool      `json:"isDm"`
		CreatorUsername string    `json:"creatorUsername"`
		CreatedAt       time.Time `json:"createdAt"`
	}
	err := db.QueryRow(
		`INSERT INTO rooms (is_dm, creator_username) VALUES (true, $1)
		 RETURNING id, is_dm, creator_username, created_at`,
		username,
	).Scan(&room.ID, &room.IsDM, &room.CreatorUsername, &room.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create DM room")
		return
	}
	db.Exec(`INSERT INTO room_members (room_id, username) VALUES ($1, $2)`, room.ID, username)
	db.Exec(`INSERT INTO room_members (room_id, username) VALUES ($1, $2)`, room.ID, body.OtherUsername)
	writeJSON(w, http.StatusCreated, room)
}

func addMember(w http.ResponseWriter, r *http.Request) {
	requester := r.Header.Get("X-Username")
	if requester == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	roomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid room id")
		return
	}
	var body struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Username == "" {
		writeError(w, http.StatusBadRequest, "username is required")
		return
	}
	var isDM bool
	var creatorUsername string
	if err := db.QueryRow(`SELECT is_dm, creator_username FROM rooms WHERE id = $1`, roomID).Scan(&isDM, &creatorUsername); err != nil {
		writeError(w, http.StatusNotFound, "room not found")
		return
	}
	if isDM {
		writeError(w, http.StatusForbidden, "cannot add members to a DM room")
		return
	}
	if requester != creatorUsername {
		writeError(w, http.StatusForbidden, "only the room owner can add members")
		return
	}
	var exists bool
	db.QueryRow(`SELECT EXISTS(SELECT 1 FROM room_members WHERE room_id = $1 AND username = $2)`, roomID, body.Username).Scan(&exists)
	if exists {
		writeError(w, http.StatusConflict, "user is already a member of this room")
		return
	}
	if _, err := db.Exec(
		`INSERT INTO room_members (room_id, username) VALUES ($1, $2)`,
		roomID, body.Username,
	); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to add member")
		return
	}
	w.WriteHeader(http.StatusOK)
}

func sendMessage(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-Username")
	if username == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	roomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid room id")
		return
	}
	var body struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Content == "" {
		writeError(w, http.StatusBadRequest, "content is required")
		return
	}
	var isMember bool
	db.QueryRow(`SELECT EXISTS(SELECT 1 FROM room_members WHERE room_id = $1 AND username = $2)`, roomID, username).Scan(&isMember)
	if !isMember {
		writeError(w, http.StatusForbidden, "you are not a member of this room")
		return
	}

	var msg struct {
		ID             int       `json:"id"`
		RoomID         int       `json:"roomId"`
		SenderUsername string    `json:"senderUsername"`
		Content        string    `json:"content"`
		CreatedAt      time.Time `json:"createdAt"`
	}
	err = db.QueryRow(
		`INSERT INTO messages (room_id, sender_username, content) VALUES ($1, $2, $3)
		 RETURNING id, room_id, sender_username, content, created_at`,
		roomID, username, body.Content,
	).Scan(&msg.ID, &msg.RoomID, &msg.SenderUsername, &msg.Content, &msg.CreatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to send message")
		return
	}
	writeJSON(w, http.StatusCreated, msg)
}

func getRooms(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-Username")
	if username == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	rows, err := db.Query(`
		SELECT r.id, r.is_dm, r.creator_username, r.created_at,
			CASE
				WHEN r.is_dm THEN (
					SELECT rm2.username FROM room_members rm2
					WHERE rm2.room_id = r.id AND rm2.username != $1
					LIMIT 1
				)
				ELSE r.name
			END AS name
		FROM rooms r
		JOIN room_members rm ON rm.room_id = r.id
		WHERE rm.username = $1
		ORDER BY r.created_at DESC
	`, username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get rooms")
		return
	}
	defer rows.Close()
	type Room struct {
		ID              int       `json:"id"`
		IsDM            bool      `json:"isDm"`
		CreatorUsername string    `json:"creatorUsername"`
		CreatedAt       time.Time `json:"createdAt"`
		Name            *string   `json:"name"`
	}
	rooms := []Room{}
	for rows.Next() {
		var room Room
		if err := rows.Scan(&room.ID, &room.IsDM, &room.CreatorUsername, &room.CreatedAt, &room.Name); err == nil {
			rooms = append(rooms, room)
		}
	}
	writeJSON(w, http.StatusOK, rooms)
}

func deleteRoom(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-Username")
	if username == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	roomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid room id")
		return
	}
	var isDM bool
	var creator string
	if err := db.QueryRow(
		`SELECT is_dm, creator_username FROM rooms WHERE id = $1`, roomID,
	).Scan(&isDM, &creator); err != nil {
		writeError(w, http.StatusNotFound, "room not found")
		return
	}
	if isDM {
		writeError(w, http.StatusForbidden, "cannot delete a DM room")
		return
	}
	if creator != username {
		writeError(w, http.StatusForbidden, "only the creator can delete this room")
		return
	}
	db.Exec(`DELETE FROM rooms WHERE id = $1`, roomID)
	w.WriteHeader(http.StatusOK)
}

func getUnreads(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-Username")
	if username == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	rows, err := db.Query(`
		SELECT rm.room_id, COUNT(m.id) AS unread_count
		FROM room_members rm
		LEFT JOIN room_last_read rlr ON rlr.room_id = rm.room_id AND rlr.username = rm.username
		LEFT JOIN messages m ON m.room_id = rm.room_id
			AND m.created_at > COALESCE(rlr.last_read_at, '-infinity')
			AND m.sender_username != rm.username
		WHERE rm.username = $1
		GROUP BY rm.room_id
		HAVING COUNT(m.id) > 0
	`, username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get unreads")
		return
	}
	defer rows.Close()
	type Unread struct {
		RoomID      int `json:"roomId"`
		UnreadCount int `json:"unreadCount"`
	}
	unreads := []Unread{}
	for rows.Next() {
		var u Unread
		if err := rows.Scan(&u.RoomID, &u.UnreadCount); err == nil {
			unreads = append(unreads, u)
		}
	}
	writeJSON(w, http.StatusOK, unreads)
}

func clearUnreads(w http.ResponseWriter, r *http.Request) {
	username := r.Header.Get("X-Username")
	if username == "" {
		writeError(w, http.StatusBadRequest, "X-Username header required")
		return
	}
	roomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid room id")
		return
	}
	db.Exec(`
		INSERT INTO room_last_read (room_id, username, last_read_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (room_id, username) DO UPDATE SET last_read_at = NOW()
	`, roomID, username)
	w.WriteHeader(http.StatusOK)
}
