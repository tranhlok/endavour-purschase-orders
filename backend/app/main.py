from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import purchase_orders, order_items

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(purchase_orders.router, prefix="/api")
app.include_router(order_items.router, prefix="/api")