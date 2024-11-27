### How to delete local DynamoDB table and s3 bucket (if there is existing db and buckets)

```bash
# Delete all objects in S3 bucket first (required before deleting bucket)
aws --endpoint-url=http://localhost:4566 s3 rm s3://purchase-orders-docs --recursive

# Delete the S3 bucket
aws --endpoint-url=http://localhost:4566 s3 rb s3://purchase-orders-docs

# Delete the DynamoDB table
aws --endpoint-url=http://localhost:4566 dynamodb delete-table --table-name purchase_orders
```

### Start Fresh with a new Docker

```bash
# Stop and remove existing containers (if there is any)
docker-compose down -v

# Start fresh containers
docker-compose up -d

# Wait for LocalStack to be ready (about 10-15 seconds)

# Create a new venv from the requirement.txt
# Activate the virtual environment 
source venv/bin/activate

# Run setup script to create the db and all s3
    python scripts/setup_local.py 
```
### Run the FastAPI server

```bash
uvicorn app.main:app --reload --port 8000 
```

### Download a file from S3

```bash
# List all files in the bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://purchase-orders-docs/

# Download a specific file (replace the path with your file path from the list)
aws --endpoint-url=http://localhost:4566 s3 cp s3://purchase-orders-docs/1732234437123/Loc_Tran___Resume_Edu_Email.pdf ./downloaded_file.pdf

# Or download everything recursively
aws --endpoint-url=http://localhost:4566 s3 cp s3://purchase-orders-docs/ ./downloads/ --recursive
```