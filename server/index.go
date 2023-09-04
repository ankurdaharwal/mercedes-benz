package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// nric represents a mapping between nric and wallet addresses.
type nric struct {
	ID      string `json:"id"`
	Nric    string `json:"nric"`
	Address string `json:"address"`
}

var nrics = []nric{}
var dbConnStr string
var port string

func main() {

	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Some error in loading environment: %s\n", err)
	}

	dbConnStr = os.Getenv("DB_HOST")
	fmt.Printf("DB Connection String: %s\n", dbConnStr)

	port = ":" + os.Getenv("PORT")
	fmt.Printf("PORT %s\n", port)

	// CORS for https://localhost:3000 origin, allowing:
	// - PUT and PATCH methods
	// - Origin header
	// - Credentials share
	// - Preflight requests cached for 12 hours

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://localhost:3000", "https://mercedes-benz-an1cu12.vercel.app"},
		AllowMethods:     []string{"POST", "GET", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "x-requested-with"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/nrics", getNrics)
	router.GET("/nrics/:address", getNricByAddress)
	router.POST("/nrics", postNrics)

	router.Run(port)
}

func connectDb(connStr string) *sql.DB {
	// Connect to database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Printf("\nSuccessfully connected to database!\n")
	return db
}

// postNrics adds nrics from JSON received in the request body.
func postNrics(c *gin.Context) {
	var newNric nric

	db := connectDb(dbConnStr)
	defer db.Close()

	// Call BindJSON to bind the received JSON to
	// newNric.
	if err := c.BindJSON(&newNric); err != nil {
		return
	}

	// Add the new nric to the db
	sqlStatement := `INSERT INTO nric (id, nric, address) VALUES ($1, $2, $3)`
	fmt.Printf("sqlStatement: %v\n", sqlStatement)
	_, err := db.Exec(sqlStatement, newNric.ID, newNric.Nric, newNric.Address)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		panic(err)
	}

	// Add the new nric to the slice.
	nrics = append(nrics, newNric)
	c.IndentedJSON(http.StatusCreated, newNric)
}

// getNrics responds with the list of all nrics as JSON.
func getNrics(c *gin.Context) {
	var (
		id      int
		nric    string
		address string
	)
	db := connectDb(dbConnStr)
	defer db.Close()

	// Allow CORS
	allowList := map[string]bool{
		"https://localhost:3000":                   true,
		"https://mercedes-benz-an1cu12.vercel.app": true,
	}

	if origin := c.Request.Header.Get("Origin"); allowList[origin] {
		c.Header("Access-Control-Allow-Origin", origin)
	}

	var nricData = make(map[string]string)

	// Add the new nric to the db
	sqlStatement := `SELECT id, nric, address from nric`
	fmt.Printf("sqlStatement: %v\n", sqlStatement)
	rows, err := db.Query(sqlStatement)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		panic(err)
	}
	defer rows.Close()
	for rows.Next() {
		err := rows.Scan(&id, &nric, &address)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			panic(err)
		}
		fmt.Printf("id: %v, nric: %v, address: %v\n", id, nric, address)
		nricData[address] = nric
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	c.IndentedJSON(http.StatusOK, gin.H{
		"nrics": nricData,
	})
}

// getNricByAddress locates the nric for a wallet address
// parameter sent by the client, then returns that nric as a response.
func getNricByAddress(c *gin.Context) {
	addressParam := c.Param("address")

	var (
		id      int
		nric    string
		address string
	)
	db := connectDb(dbConnStr)
	defer db.Close()

	// Allow CORS
	allowList := map[string]bool{
		"https://localhost:3000":                   true,
		"https://mercedes-benz-an1cu12.vercel.app": true,
	}

	if origin := c.Request.Header.Get("Origin"); allowList[origin] {
		c.Header("Access-Control-Allow-Origin", origin)
	}

	var nricData = make(map[string]string)

	// Add the new nric to the db
	sqlStatement := `SELECT id, nric, address from nric WHERE address = $1`
	fmt.Printf("sqlStatement: %v\n", sqlStatement)
	rows, err := db.Query(sqlStatement, addressParam)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		panic(err)
	}
	defer rows.Close()
	for rows.Next() {
		err := rows.Scan(&id, &nric, &address)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			panic(err)
		}
		fmt.Printf("id: %v, nric: %v, address: %v\n", id, nric, address)
		nricData[address] = nric
	}
	err = rows.Err()
	if err != nil {
		panic(err)
	}
	c.IndentedJSON(http.StatusOK, gin.H{
		"nric": nricData,
	})
}
