# Purchase Orders System


A full-stack application for managing purchase orders with PDF processing capabilities.

## Architecture Overview:
### Frontend: Next.js application with:
- React components using modern hooks
- TailwindCSS for styling
- shadcn/ui component library
- File upload and processing capabilities
###Backend: FastAPI application with:
- AWS services (DynamoDB and S3) for storage
- LocalStack for local development
- PDF processing capabilities
- RESTful API endpoints
### Key Features:
- Purchase order management
- PDF file upload and processing
- Data extraction from PDFs
- Item matching system
- Status tracking (Processing, Review, Finalized, Failed)
- Search and filtering capabilities

## Component Architecture and State Management
### Frontend Architecture:
- The frontend is built using Next.js, a React framework for server-side rendering and static site generation.
- Components are organized into directories like layout, purchase-orders, and ui, which helps in maintaining a clean structure.
- State management is handled using React's useState, useReducer, and useEffect hooks. For example, the NewOrderSheet component uses useReducer to manage complex state transitions related to file uploads and data extraction.
### State Management:
- useState: Used for simple state management, such as toggling UI elements or storing input values.
- useReducer: Used in NewOrderSheet for managing more complex state transitions, such as handling file uploads, data extraction, and matching processes.
- useEffect: Used for side effects like fetching data from the API when the component mounts or when certain state variables change.

## API Design and Integration
### Backend API:
- Built using FastAPI, a modern, fast (high-performance) web framework for building APIs with Python 3.7+.
- The API is organized into routers, such as purchase_orders and order_items, which handle different aspects of the application.
- CORS middleware is configured to allow requests from the frontend running on localhost:3000.
### Purchase Orders API (/api/orders/):
#### Create New Order
```python
POST /api/orders
# Accepts multipart/form-data with PDF file
# Returns created order object
```
#### Get Orders List
```python
GET /api/orders
# Optional query parameters:
# - filter_type: Filter orders by status
# - search: Search term for orders
# Returns list of orders
```
#### Get File URL
```python
GET /api/orders/{order_id}/files/{file_type}
# Returns presigned S3 URL for file download
```
#### Update Order Status
```python
PATCH /api/orders/{order_id}/status
# Request body: { "status": "Processing|Review|Finalized|Failed" }
# Returns updated order
```
#### Get Matches CSV
```python
GET /api/orders/{order_id}/matches-csv
# Returns presigned URL for downloading matches CSV
```

### Order Items API (/api/orders/{order_id}/items)
#### Create/Update Order Items
```python
POST /api/orders/{order_id}/items
POST /api/orders/{order_id}/items
# Request body example:
[
    {
        "request_item": "Brass Nut 1/2\" 20mm Galvan",
        "quantity": 36,
        "uom": "ea",
        "price_per_unit": 11.48,
        "amount": 413.28
    }
]
# Returns list of created/updated items
```
#### Get Order Items
```python
GET /api/orders/{order_id}/items
# Returns list of items for specific order
```
### Update Items Matches
```python
PATCH /api/orders/{order_id}/items/matches
# Request body example:
[
    {
        "item_id": "item1",
        "request_item": "Updated Item Name",
        "quantity": 10,
        "uom": "boxes",
        "price_per_unit": "15.00",
        "amount": "150.00",
        "match": "matches"
    }
]
# Returns updated items and generates CSV
```

## File Processing Workflow
### File Upload and Processing:
- Users can upload PDF files through the NewOrderSheet component.
- The file is first selected and displayed using a temporary URL.
- Upon confirmation, the file is uploaded to the backend, where it is processed for data extraction.
- Extracted data is then used for further operations like matching and saving order items.
### Data Extraction and Matching:
- The handleExtractData function sends the uploaded file to an external API for data extraction.
- Extracted data is stored in the component's state and displayed to the user.
- The handleGenerateMapping function sends extracted data to another API for matching, and the results are integrated back into the state.

## Database Schema and Operations
### Database:
- The application uses AWS DynamoDB for storing purchase orders and related data.
- LocalStack is used for local development, simulating AWS services.
### Key Operations:
- DynamoDBService: Handles operations like fetching orders, updating order statuses, and managing order items.
- S3Service: Manages file uploads and generates presigned URLs for file access.
### Schema:
- The OrderItem model defines the structure of order items, using Pydantic for data validation.
- The OrderStatus enum defines possible statuses for orders, ensuring consistency across the application.

## Project Structure
```
purchase-orders-system/
├── .gitignore                  # Root gitignore
├── .dockerignore              # Root dockerignore
├── README.md                  # Root readme
│
├── backend/
│   ├── .env.example           # Backend environment variables example
│   ├── .gitignore            # Backend specific gitignore
│   ├── requirements.txt      # Python dependencies
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application entry
│   │   │
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── purchase_orders.py
│   │   │
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── dynamodb.py
│   │       └── s3.py
│   │
│   ├── scripts/
│   │   ├── generate_test_data.py
│   │   └── setup_local.py
│   │
│   └── docs/
│       └── how_to_test.md
│
├── frontend/
│   ├── .env.example           # Frontend environment variables example
│   ├── .gitignore            # Frontend specific gitignore
│   ├── package.json
│   ├── next.config.mjs
│   ├── components.json       # shadcn/ui configuration
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.js
│   │   │   └── page.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── header.jsx
│   │   │   │   └── sidebar.jsx
│   │   │   │
│   │   │   ├── purchase-orders/
│   │   │   │   ├── file-upload.jsx
│   │   │   │   ├── filter-tabs.jsx
│   │   │   │   ├── new-order-sheet.jsx
│   │   │   │   ├── purchase-orders-table.jsx
│   │   │   │   └── search-bar.jsx
│   │   │   │
│   │   │   └── ui/
│   │   │       ├── button.jsx
│   │   │       ├── input.jsx
│   │   │       ├── sheet.jsx
│   │   │       └── table.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── use-orders.jsx
│   │   │
│   │   └── lib/
│   │       └── utils.js
│   │
│   ├── public/
│   │   └── assets/
│   │
│   └── README.md             # Frontend specific readme
│
└── docker-compose.yml        # For local development services
```

