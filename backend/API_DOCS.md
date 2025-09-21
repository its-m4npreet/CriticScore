# CriticScore API Documentation

## Overview

CriticScore is a movie rating website API that allows authenticated users to rate and review movies. Only admins can add movies to the platform. The API is built with Node.js, Express, MongoDB (Mongoose), and Clerk for authentication.

## Base URL

```
http://localhost:3000
```

## Authentication

This API uses Clerk for authentication. Include the Clerk session token in the Authorization header:

```
Authorization: Bearer <clerk_session_token>
```

## Response Format

All API responses follow this format:

### Success Response

```json
{
  "data": {...},
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "error": "Error message description"
}
```

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-09-21T10:30:00.000Z",
  "uptime": 1234.56
}
```

---

## User Management

### Get Current User

#### GET /api/users/me

Get the current authenticated user's basic information.

**Authentication:** Required

**Response:**

```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "imageUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastSignInAt": "2025-09-21T10:00:00.000Z",
  "emailVerified": true
}
```

### Get Current User Profile

#### GET /api/users/profile

Get the current authenticated user's complete profile with metadata.

**Authentication:** Required

**Response:**

```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "imageUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastSignInAt": "2025-09-21T10:00:00.000Z",
  "emailVerified": true,
  "phoneNumbers": [],
  "externalAccounts": [],
  "publicMetadata": {},
  "privateMetadata": {}
}
```

### Update User Metadata

#### PUT /api/users/metadata

Update the current user's metadata.

**Authentication:** Required

**Request Body:**

```json
{
  "publicMetadata": {
    "bio": "Movie enthusiast",
    "favoriteGenre": "Sci-Fi"
  },
  "privateMetadata": {
    "preferences": {
      "notifications": true
    }
  }
}
```

**Response:**

```json
{
  "id": "user_abc123",
  "publicMetadata": {
    "bio": "Movie enthusiast",
    "favoriteGenre": "Sci-Fi"
  },
  "privateMetadata": {
    "preferences": {
      "notifications": true
    }
  }
}
```

### Get User Rating Statistics

#### GET /api/users/me/stats

Get the current user's rating statistics.

**Authentication:** Required

**Response:**

```json
{
  "totalRatings": 25,
  "averageRating": 7.2,
  "totalReviews": 15
}
```

### Get Current User's Ratings

#### GET /api/users/me/ratings

Get all ratings by the current user.

**Authentication:** Required

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc/desc (default: desc)

**Response:**

```json
{
  "ratings": [
    {
      "_id": "rating_123",
      "movieId": {
        "_id": "movie_456",
        "title": "The Matrix",
        "poster": "https://example.com/matrix-poster.jpg",
        "releaseDate": "1999-03-31T00:00:00.000Z",
        "director": "The Wachowskis"
      },
      "rating": 9,
      "review": "Mind-blowing sci-fi masterpiece!",
      "isPublic": true,
      "helpfulVotes": 5,
      "createdAt": "2025-09-20T15:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get User by ID

#### GET /api/users/:id

Get a specific user by their ID. Users can only access their own data unless they are admins.

**Authentication:** Required

**Parameters:**

- `id`: User ID

**Response:** Same as GET /api/users/me

### Get User's Ratings by ID

#### GET /api/users/:id/ratings

Get ratings by a specific user. Users can only access their own ratings unless they are admins.

**Authentication:** Required

**Parameters:**

- `id`: User ID

**Query Parameters:** Same as GET /api/users/me/ratings

**Response:** Same as GET /api/users/me/ratings

---

## Movies

### Get All Movies

#### GET /api/movies

Get all active movies with pagination and filtering.

**Authentication:** Not required

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `genre` (optional): Filter by genre
- `search` (optional): Search in title, description, director
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc/desc (default: desc)
- `featured` (optional): true to show only featured movies

**Response:**

```json
{
  "movies": [
    {
      "_id": "movie_456",
      "title": "The Matrix",
      "description": "A computer programmer discovers reality is a simulation...",
      "director": "The Wachowskis",
      "cast": ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
      "genre": ["Action", "Sci-Fi"],
      "releaseDate": "1999-03-31T00:00:00.000Z",
      "duration": 136,
      "language": "English",
      "country": "USA",
      "poster": "https://example.com/matrix-poster.jpg",
      "trailer": "https://example.com/matrix-trailer.mp4",
      "averageRating": 8.7,
      "totalRatings": 1542,
      "featured": true,
      "createdAt": "2025-09-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Movie by ID

#### GET /api/movies/:id

Get a specific movie with its reviews and user's rating (if authenticated).

**Authentication:** Optional (shows user's rating if authenticated)

**Parameters:**

- `id`: Movie ID

**Response:**

```json
{
  "_id": "movie_456",
  "title": "The Matrix",
  "description": "A computer programmer discovers reality is a simulation...",
  "director": "The Wachowskis",
  "cast": ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
  "genre": ["Action", "Sci-Fi"],
  "releaseDate": "1999-03-31T00:00:00.000Z",
  "duration": 136,
  "language": "English",
  "country": "USA",
  "poster": "https://example.com/matrix-poster.jpg",
  "trailer": "https://example.com/matrix-trailer.mp4",
  "averageRating": 8.7,
  "totalRatings": 1542,
  "featured": true,
  "reviews": [
    {
      "_id": "rating_789",
      "userId": "user_xyz",
      "rating": 10,
      "review": "Absolutely revolutionary!",
      "helpfulVotes": 25,
      "createdAt": "2025-09-15T12:00:00.000Z"
    }
  ],
  "userRating": {
    "_id": "rating_123",
    "rating": 9,
    "review": "Mind-blowing sci-fi masterpiece!",
    "isPublic": true,
    "createdAt": "2025-09-20T15:30:00.000Z"
  }
}
```

### Get Movie Ratings

#### GET /api/movies/:id/ratings

Get all public ratings/reviews for a specific movie.

**Authentication:** Not required

**Parameters:**

- `id`: Movie ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (default: helpfulVotes)
- `sortOrder` (optional): asc/desc (default: desc)

**Response:**

```json
{
  "ratings": [
    {
      "_id": "rating_789",
      "userId": "user_xyz",
      "rating": 10,
      "review": "Absolutely revolutionary!",
      "helpfulVotes": 25,
      "isPublic": true,
      "createdAt": "2025-09-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalCount": 300,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Rate a Movie

#### POST /api/movies/:id/rate

Create or update a rating for a movie.

**Authentication:** Required

**Parameters:**

- `id`: Movie ID

**Request Body:**

```json
{
  "rating": 9,
  "review": "Mind-blowing sci-fi masterpiece!",
  "isPublic": true
}
```

**Validation:**

- `rating`: Required, integer between 1-10
- `review`: Optional, max 1000 characters
- `isPublic`: Optional, boolean (default: true)

**Response (201 for new, 200 for update):**

```json
{
  "message": "Rating created successfully",
  "data": {
    "_id": "rating_123",
    "movieId": "movie_456",
    "userId": "user_abc123",
    "rating": 9,
    "review": "Mind-blowing sci-fi masterpiece!",
    "isPublic": true,
    "helpfulVotes": 0,
    "createdAt": "2025-09-21T10:30:00.000Z"
  }
}
```

### Delete Movie Rating

#### DELETE /api/movies/:id/rate

Delete the current user's rating for a movie.

**Authentication:** Required

**Parameters:**

- `id`: Movie ID

**Response:**

```json
{
  "message": "Rating deleted successfully"
}
```

### Mark Review as Helpful

#### POST /api/movies/ratings/:ratingId/helpful

Mark a review as helpful.

**Authentication:** Required

**Parameters:**

- `ratingId`: Rating ID

**Response:**

```json
{
  "message": "Review marked as helpful",
  "data": {
    "helpfulVotes": 26
  }
}
```

### Remove Helpful Mark

#### DELETE /api/movies/ratings/:ratingId/helpful

Remove helpful mark from a review.

**Authentication:** Required

**Parameters:**

- `ratingId`: Rating ID

**Response:**

```json
{
  "message": "Helpful mark removed",
  "data": {
    "helpfulVotes": 25
  }
}
```

---

## Admin Routes

All admin routes require authentication and admin role.

### User Management

#### GET /api/admin/users

Get list of all users with pagination.

**Authentication:** Required (Admin)

**Query Parameters:**

- `limit` (optional): Items per page (default: 10)
- `offset` (optional): Number to skip (default: 0)
- `emailAddress` (optional): Filter by email

**Response:**

```json
{
  "users": [
    {
      "id": "user_abc123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "imageUrl": "https://example.com/avatar.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastSignInAt": "2025-09-21T10:00:00.000Z",
      "emailVerified": true
    }
  ],
  "totalCount": 1500,
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

#### PUT /api/admin/users/:id/ban

Ban or unban a user.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: User ID

**Request Body:**

```json
{
  "banned": true
}
```

**Response:**

```json
{
  "message": "User banned successfully",
  "data": {
    "id": "user_abc123",
    "banned": true
  }
}
```

#### DELETE /api/admin/users/:id

Delete a user account.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: User ID

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

#### PUT /api/admin/users/:id/admin

Set user admin status.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: User ID

**Request Body:**

```json
{
  "isAdmin": true
}
```

**Response:**

```json
{
  "message": "User promoted to admin",
  "data": {
    "id": "user_abc123",
    "role": "admin"
  }
}
```

### Movie Management

#### GET /api/admin/movies

Get all movies including inactive ones.

**Authentication:** Required (Admin)

**Query Parameters:** Same as GET /api/movies plus:

- `activeOnly` (optional): Filter by active status

**Response:** Same as GET /api/movies

#### POST /api/admin/movies

Create a new movie.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "title": "The Matrix Reloaded",
  "description": "Neo and his allies race against time...",
  "director": "The Wachowskis",
  "cast": ["Keanu Reeves", "Laurence Fishburne"],
  "genre": ["Action", "Sci-Fi"],
  "releaseDate": "2003-05-15",
  "duration": 138,
  "language": "English",
  "country": "USA",
  "poster": "https://example.com/poster.jpg",
  "trailer": "https://example.com/trailer.mp4",
  "imdbId": "tt0234215",
  "budget": 150000000,
  "boxOffice": 742128461
}
```

**Required Fields:**

- title, description, director, releaseDate, duration, language, country

**Response (201):**

```json
{
  "message": "Movie created successfully",
  "data": {
    "_id": "movie_789",
    "title": "The Matrix Reloaded",
    "description": "Neo and his allies race against time...",
    "director": "The Wachowskis",
    "addedBy": "user_admin123",
    "isActive": true,
    "featured": false,
    "averageRating": 0,
    "totalRatings": 0,
    "createdAt": "2025-09-21T10:30:00.000Z"
  }
}
```

#### PUT /api/admin/movies/:id

Update a movie.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Movie ID

**Request Body:** Same fields as POST /api/admin/movies (all optional)

**Response:**

```json
{
  "message": "Movie updated successfully",
  "data": {
    // Updated movie object
  }
}
```

#### DELETE /api/admin/movies/:id

Delete a movie and all its ratings.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Movie ID

**Response:**

```json
{
  "message": "Movie and associated ratings deleted successfully"
}
```

#### PUT /api/admin/movies/:id/status

Toggle movie active status.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Movie ID

**Request Body:**

```json
{
  "isActive": false
}
```

**Response:**

```json
{
  "message": "Movie deactivated successfully",
  "data": {
    "_id": "movie_456",
    "isActive": false
  }
}
```

#### PUT /api/admin/movies/:id/featured

Toggle movie featured status.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Movie ID

**Request Body:**

```json
{
  "featured": true
}
```

**Response:**

```json
{
  "message": "Movie featured successfully",
  "data": {
    "_id": "movie_456",
    "featured": true
  }
}
```

#### GET /api/admin/movies/:id/ratings

Get all ratings for a movie including private ones.

**Authentication:** Required (Admin)

**Parameters:**

- `id`: Movie ID

**Query Parameters:** Same as GET /api/movies/:id/ratings

**Response:** Same as GET /api/movies/:id/ratings but includes private reviews

### Statistics

#### GET /api/admin/stats

Get admin dashboard statistics.

**Authentication:** Required (Admin)

**Response:**

```json
{
  "movies": {
    "totalMovies": 1000,
    "activeMovies": 950,
    "featuredMovies": 25,
    "totalRatings": 15000,
    "averageRatingOverall": 7.2
  }
}
```

---

## Movie Management Workflow

### Adding Movies to the Platform

Only admin users can add movies to CriticScore. Here's the typical workflow:

1. **Become an Admin** (see Admin User Setup section)
2. **Create a Movie** using `POST /api/admin/movies`
3. **Optional: Set as Featured** using `PUT /api/admin/movies/:id/featured`
4. **Users Can Now Rate** the movie using `POST /api/movies/:id/rate`

### Movie Creation Example

```bash
# Create a new movie (admin only)
POST /api/admin/movies
Authorization: Bearer <admin_clerk_token>
Content-Type: application/json

{
  "title": "Inception",
  "description": "A thief who enters the dreams of others...",
  "director": "Christopher Nolan",
  "cast": ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"],
  "genre": ["Action", "Sci-Fi", "Thriller"],
  "releaseDate": "2010-07-16",
  "duration": 148,
  "language": "English",
  "country": "USA",
  "poster": "https://example.com/inception-poster.jpg",
  "trailer": "https://youtube.com/watch?v=inception_trailer",
  "imdbId": "tt1375666",
  "budget": 160000000,
  "boxOffice": 836836967
}
```

### Movie Lifecycle

1. **Created** - Movie is added by admin, defaults to `isActive: true`
2. **Public** - Users can view and rate the movie
3. **Featured** - Admin can mark as featured for homepage display
4. **Deactivated** - Admin can set `isActive: false` to hide from public (but keep ratings)
5. **Deleted** - Admin can permanently delete movie and all associated ratings

---

## Data Models

### Movie Schema

```javascript
{
  title: String (required, max 200),
  description: String (required, max 2000),
  director: String (required, max 100),
  cast: [String] (max 100 each),
  genre: [String] (predefined enum),
  releaseDate: Date (required),
  duration: Number (required, in minutes),
  language: String (required),
  country: String (required),
  poster: String (URL),
  trailer: String (URL),
  imdbId: String (unique),
  budget: Number,
  boxOffice: Number,
  averageRating: Number (0-10, calculated),
  totalRatings: Number (calculated),
  addedBy: String (Clerk user ID),
  isActive: Boolean (default: true),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Rating Schema

```javascript
{
  movieId: ObjectId (ref: Movie, required),
  userId: String (Clerk user ID, required),
  rating: Number (required, 1-10),
  review: String (max 1000),
  isPublic: Boolean (default: true),
  helpfulVotes: Number (default: 0),
  helpfulBy: [String] (Clerk user IDs),
  createdAt: Date,
  updatedAt: Date
}
```

### Available Genres

- Action
- Adventure
- Animation
- Biography
- Comedy
- Crime
- Documentary
- Drama
- Family
- Fantasy
- History
- Horror
- Music
- Mystery
- Romance
- Sci-Fi
- Sport
- Thriller
- War
- Western

---

## Error Codes

- `400` - Bad Request (validation errors, invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server error)

---

## Admin User Setup

### Initial Admin Creation

Since only admins can add movies and manage users, you need to create the first admin user. There are several ways to do this:

#### Method 1: Environment Variable (Recommended for Development)

1. Add your email to the `.env` file:

```env
SUPER_ADMIN_EMAIL=your-email@example.com
```

2. Register with Clerk using that email address
3. Restart the server - you'll automatically be promoted to admin

#### Method 2: Development Endpoints (Development Only)

When `NODE_ENV=development`, you can use these endpoints:

##### POST /dev/make-admin

Manually promote a user to admin.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

or

```json
{
  "userId": "user_clerk_id"
}
```

**Response:**

```json
{
  "message": "User successfully promoted to admin",
  "userData": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "promotedAt": "2025-09-21T10:30:00.000Z"
  }
}
```

##### GET /dev/admin-status/:userId

Check if a user is admin.

##### GET /dev/list-admins

List all admin users.

#### Method 3: Use Admin API (After First Admin)

Once you have at least one admin, you can promote other users:

**PUT /api/admin/users/:id/admin**

---

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/criticscore
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Super Admin Configuration (optional)
SUPER_ADMIN_EMAIL=your-email@example.com
```

---

## Quick Start Guide

### 1. Setup Environment

```bash
# Clone and install
git clone <repository-url>
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials
```

### 2. Configure Environment Variables

```env
# Required
CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
MONGODB_URI=mongodb://localhost:27017/criticscore

# Optional - for auto admin setup
SUPER_ADMIN_EMAIL=admin@example.com
NODE_ENV=development
```

### 3. Start Services

```bash
# Start MongoDB (if local)
mongod

# Start the API server
npm run dev
```

### 4. Create First Admin

1. Register at your Clerk frontend with the email from `SUPER_ADMIN_EMAIL`
2. Server will automatically promote you to admin on startup
3. Alternatively, use `POST /dev/make-admin` in development

### 5. Add Your First Movie

```bash
curl -X POST http://localhost:3000/api/admin/movies \
  -H "Authorization: Bearer <your_clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your First Movie",
    "description": "A great movie...",
    "director": "Director Name",
    "releaseDate": "2024-01-01",
    "duration": 120,
    "language": "English",
    "country": "USA"
  }'
```

### 6. Test User Rating

```bash
curl -X POST http://localhost:3000/api/movies/<movie_id>/rate \
  -H "Authorization: Bearer <user_clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 9,
    "review": "Amazing movie!",
    "isPublic": true
  }'
```

---

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file

3. Start MongoDB

4. Run the server:

   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

5. The API will be available at `http://localhost:3000`

---

## Rate Limiting & Pagination

- All paginated endpoints default to 20 items per page
- Maximum items per page: 100
- Pagination uses offset-based approach with `page` and `limit` parameters

---

## Security Features

- Clerk authentication for all protected routes
- Role-based access control (Admin/User)
- Input validation and sanitization
- MongoDB injection prevention through Mongoose
- Admin-only routes for movie management
- User isolation (users can only access their own data unless admin)
