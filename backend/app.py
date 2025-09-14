# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from routes import (
    employees,
    categories,
    suppliers,
    products,
    sales,
    credits,
    days,
    reports,
)
from auth import routes as auth_routes


# ===== FastAPI App =====
app = FastAPI(
    title="Inventory Management System",
    description=(
        "Backend API for IMS with role-based access control, "
        "employee management, suppliers, products, sales, credits, "
        "daily operations, and reporting."
    ),
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",  # versioned docs
    docs_url="/api/v1/docs",             # Swagger UI
    redoc_url="/api/v1/redoc",           # ReDoc UI
)


# ===== Middleware =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # local React/Vite frontend
        "https://yourdomain.com",   # TODO: replace with production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Register Routers =====
api_prefix = "/api/v1"

app.include_router(auth_routes.router, prefix=api_prefix)
app.include_router(employees.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(suppliers.router, prefix=api_prefix)
app.include_router(products.router, prefix=api_prefix)
app.include_router(sales.router, prefix=api_prefix)
app.include_router(credits.router, prefix=api_prefix)
app.include_router(days.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)


# ===== Root Health Check =====
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "Inventory Management System API is running 🚀",
        "docs_url": "/api/v1/docs",
        "redoc_url": "/api/v1/redoc",
        "version": "1.0.0",
    }

