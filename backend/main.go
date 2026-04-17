package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:123456@localhost:5432/chat_demo?sslmode=disable"
	}
	initDB(dbURL)
	defer db.Close()

	mux := http.NewServeMux()
	registerRoutes(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on :%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), corsMiddleware(mux)))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowedOrigin := os.Getenv("FRONTEND_URL")
		if allowedOrigin != "" {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Username")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
