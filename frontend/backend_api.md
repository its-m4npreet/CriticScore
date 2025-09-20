# CriticScore Backend API Design

## Endpoints

### 1. Get All Movies

- **GET** `/api/movies`
- **Response:**

```json
[
  {
    "name": "string",
    "image": "string (url)",
    "desc": "string",
    "year": 2023,
    "rating": 8.5,
    "trending": true,
    "top": false,
    "category": "string",
    "upcoming": false,
    "watchlist": false
  },
  ...
]
```

### 2. Get Movie by Name

- **GET** `/api/movies/:name`
- **Response:**

```json
{
  "name": "string",
  "image": "string (url)",
  "desc": "string",
  "year": 2023,
  "rating": 8.5,
  "trending": true,
  "top": false,
  "category": "string",
  "upcoming": false,
  "watchlist": false
}
```

### 3. Search Movies

- **GET** `/api/movies/search?q=keyword`
- **Response:** Same as Get All Movies (filtered)

### 4. Update Watchlist

- **POST** `/api/movies/:name/watchlist`
- **Request:**

```json
{
  "watchlist": true
}
```

- **Response:**

```json
{
  "success": true,
  "movie": { ...updated movie object... }
}
```

### 5. Get Categories

- **GET** `/api/categories`
- **Response:**

```json
["Action", "Fantasy", "Sports", "Adventure", "Comedy", "Horror"]
```

### 6. Get Movies by Category

- **GET** `/api/categories/:category/movies`
- **Response:** Same as Get All Movies (filtered)

---

## Notes

- All endpoints return JSON.
- For production, add authentication for user-specific watchlists.
- Extendable for user ratings, reviews, etc.
