package main

// raven built this
// https://github.com/ravvdevv

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// App struct
type App struct {
	ctx context.Context
	db  *sql.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Use a persistent path for the database
	home, _ := os.UserHomeDir()
	dbPath := filepath.Join(home, ".stockly", "stockly.db")
	os.MkdirAll(filepath.Dir(dbPath), 0755)

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		fmt.Printf("Error opening database: %v\n", err)
		return
	}
	a.db = db
	a.initDB()
}

func (a *App) initDB() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS categories (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			createdAt TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS products (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			sku TEXT UNIQUE NOT NULL,
			category TEXT,
			price REAL,
			stock INTEGER,
			createdAt TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS sales (
			id TEXT PRIMARY KEY,
			subtotal REAL,
			tax REAL,
			taxRate REAL,
			total REAL,
			paymentMethod TEXT,
			amountTendered REAL,
			changeDue REAL,
			createdAt TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS sale_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			saleId TEXT,
			productId TEXT,
			productName TEXT,
			quantity INTEGER,
			price REAL,
			FOREIGN KEY(saleId) REFERENCES sales(id)
		)`,
	}

	for _, q := range queries {
		_, err := a.db.Exec(q)
		if err != nil {
			fmt.Printf("Error creating table: %v\n", err)
		}
	}
}

// Product models
type Product struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	SKU       string  `json:"sku"`
	Category  string  `json:"category"`
	Price     float64 `json:"price"`
	Stock     int     `json:"stock"`
	CreatedAt string  `json:"createdAt"`
}

type SaleItem struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
}

type Sale struct {
	ID             string     `json:"id"`
	Items          []SaleItem `json:"items"`
	Subtotal       float64    `json:"subtotal"`
	Tax            float64    `json:"tax"`
	TaxRate        float64    `json:"taxRate"`
	Total          float64    `json:"total"`
	PaymentMethod  string     `json:"paymentMethod"`
	AmountTendered float64    `json:"amountTendered"`
	ChangeDue      float64    `json:"change"`
	CreatedAt      string     `json:"createdAt"`
}

type Category struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdAt"`
}

// Product Methods

func (a *App) GetProducts() []Product {
	rows, err := a.db.Query("SELECT id, name, sku, category, price, stock, createdAt FROM products")
	if err != nil {
		return []Product{}
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		rows.Scan(&p.ID, &p.Name, &p.SKU, &p.Category, &p.Price, &p.Stock, &p.CreatedAt)
		products = append(products, p)
	}
	return products
}

func (a *App) AddProduct(p Product) error {
	_, err := a.db.Exec("INSERT INTO products (id, name, sku, category, price, stock, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
		p.ID, p.Name, p.SKU, p.Category, p.Price, p.Stock, p.CreatedAt)
	return err
}

func (a *App) UpdateProduct(p Product) error {
	_, err := a.db.Exec("UPDATE products SET name=?, sku=?, category=?, price=?, stock=? WHERE id=?",
		p.Name, p.SKU, p.Category, p.Price, p.Stock, p.ID)
	return err
}

func (a *App) DeleteProduct(id string) error {
	_, err := a.db.Exec("DELETE FROM products WHERE id=?", id)
	return err
}

// Sale Methods

func (a *App) GetSales() []Sale {
	rows, err := a.db.Query("SELECT id, subtotal, tax, taxRate, total, paymentMethod, amountTendered, changeDue, createdAt FROM sales")
	if err != nil {
		return []Sale{}
	}
	defer rows.Close()

	var sales []Sale
	for rows.Next() {
		var s Sale
		rows.Scan(&s.ID, &s.Subtotal, &s.Tax, &s.TaxRate, &s.Total, &s.PaymentMethod, &s.AmountTendered, &s.ChangeDue, &s.CreatedAt)

		// Get items for this sale
		itemRows, err := a.db.Query("SELECT productId, productName, quantity, price FROM sale_items WHERE saleId = ?", s.ID)
		if err == nil {
			for itemRows.Next() {
				var item SaleItem
				itemRows.Scan(&item.ProductID, &item.ProductName, &item.Quantity, &item.Price)
				s.Items = append(s.Items, item)
			}
			itemRows.Close()
		}

		sales = append(sales, s)
	}
	return sales
}

func (a *App) CompleteSale(s Sale) error {
	tx, err := a.db.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec("INSERT INTO sales (id, subtotal, tax, taxRate, total, paymentMethod, amountTendered, changeDue, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		s.ID, s.Subtotal, s.Tax, s.TaxRate, s.Total, s.PaymentMethod, s.AmountTendered, s.ChangeDue, s.CreatedAt)
	if err != nil {
		tx.Rollback()
		return err
	}

	for _, item := range s.Items {
		_, err = tx.Exec("INSERT INTO sale_items (saleId, productId, productName, quantity, price) VALUES (?, ?, ?, ?, ?)",
			s.ID, item.ProductID, item.ProductName, item.Quantity, item.Price)
		if err != nil {
			tx.Rollback()
			return err
		}

		// Update stock
		_, err = tx.Exec("UPDATE products SET stock = stock - ? WHERE id = ?", item.Quantity, item.ProductID)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

// Category Methods

func (a *App) GetCategories() []Category {
	rows, err := a.db.Query("SELECT id, name, description, createdAt FROM categories")
	if err != nil {
		return []Category{}
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var c Category
		rows.Scan(&c.ID, &c.Name, &c.Description, &c.CreatedAt)
		categories = append(categories, c)
	}
	return categories
}

func (a *App) SaveCategory(c Category) error {
	_, err := a.db.Exec("INSERT OR REPLACE INTO categories (id, name, description, createdAt) VALUES (?, ?, ?, ?)",
		c.ID, c.Name, c.Description, c.CreatedAt)
	return err
}

func (a *App) RenameCategory(oldName string, newName string) error {
	tx, err := a.db.Begin()
	if err != nil {
		return err
	}

	// Update category name
	_, err = tx.Exec("UPDATE categories SET name=? WHERE name=?", newName, oldName)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Update all products with this category
	_, err = tx.Exec("UPDATE products SET category=? WHERE category=?", newName, oldName)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (a *App) DeleteCategory(id string) error {
	_, err := a.db.Exec("DELETE FROM categories WHERE id=?", id)
	return err
}
