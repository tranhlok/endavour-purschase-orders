# Purchase Orders System


A full-stack application for managing purchase orders with PDF processing capabilities.


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