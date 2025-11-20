# Fulfil — CSV Product Ingestion System

A CSV ingestion system built with FastAPI, Celery, Redis, PostgreSQL, React, and AWS S3. It supports uploading CSV files, background processing, and viewing ingested products with pagination.

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Celery** - Background task processing
- **Redis** - Message broker for Celery
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **AWS S3** - Cloud file storage

### Frontend
- **React** (Vite) - Fast frontend build tool
- **Axios** - HTTP client

---

## 📌 Usage Flow

1. **Open the frontend UI**
2. **Upload a CSV file** using the upload form
3. **FastAPI uploads the file to S3** and returns a file ID
4. **Celery worker downloads & processes** the CSV in the background
5. **UI polls file status** until `uploaded` → `processed`
6. **Products appear** in a paginated table once ingestion is complete

---

## 📡 API Endpoints

| Method | Endpoint                                | Description                |
|--------|-----------------------------------------|----------------------------|
| POST   | `/api/v1/upload/files/upload`          | Upload a CSV file          |
| GET    | `/api/v1/upload/files/{file_id}/status`| Check ingestion status     |
| GET    | `/api/v1/upload/products`              | Get paginated product list |


## 👤 Author

**Gayathri Ramanesh**
- GitHub: [@gayathriramanesh](https://github.com/gayathriramanesh)
- LinkedIn: [gayathri-ramanesh](https://linkedin.com/in/gayathri-ramanesh)
- Email: gayathriramanesh2001@gmail.com
