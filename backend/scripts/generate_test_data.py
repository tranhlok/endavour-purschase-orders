import boto3
import asyncio
import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.dynamodb import DynamoDBService
from app.services.s3 import S3Service
from app.config import get_settings

settings = get_settings()

# Sample PDF content for testing
SAMPLE_PDF_CONTENT = b"%PDF-1.4\n%Test PDF content"

async def create_test_orders():
    """Generate test purchase orders with various statuses and dates"""
    db = DynamoDBService()
    s3 = S3Service()
    
    # Status options
    statuses = ["Processing", "Review", "Processed", "Finalized"]
    
    # Generate 10 test orders
    for i in range(10):
        # Generate date within last 30 days
        days_ago = random.randint(0, 30)
        order_date = datetime.now() - timedelta(days=days_ago)
        
        # Create order data
        order_data = {
            "id": str(int(datetime.now().timestamp() * 1000) - i),  # Unique ID
            "date": order_date.strftime("%m/%d/%Y"),
            "status": random.choice(statuses),
            "created_at": order_date.isoformat(),
            "updated_at": order_date.isoformat()
        }
        
        try:
            # Create order in DynamoDB
            order = await db.create_order(order_data)
            print(f"Created order: {order['id']}")
            
            # Upload sample PDF files
            request_key = await s3.upload_file(
                SAMPLE_PDF_CONTENT,
                f"request_{i}.pdf",
                order['id']
            )
            print(f"Uploaded request file: {request_key}")
            
            # Randomly add response files (70% chance)
            if random.random() < 0.7:
                response_key = await s3.upload_file(
                    SAMPLE_PDF_CONTENT,
                    f"response_{i}.pdf",
                    order['id']
                )
                print(f"Uploaded response file: {response_key}")
            
        except Exception as e:
            print(f"Error creating test order {i}: {str(e)}")

async def verify_test_data():
    """Verify that test data was created successfully"""
    db = DynamoDBService()
    
    try:
        orders = await db.get_orders()
        print("\nVerification Results:")
        print(f"Total orders created: {len(orders)}")
        
        # Count orders by status
        status_counts = {}
        for order in orders:
            status = order['type']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        print("\nOrders by status:")
        for status, count in status_counts.items():
            print(f"{status}: {count}")
            
    except Exception as e:
        print(f"Error verifying test data: {str(e)}")

async def main():
    """Generate and verify test data"""
    print("Starting test data generation...")
    await create_test_orders()
    await verify_test_data()
    print("\nTest data generation complete!")

if __name__ == "__main__":
    asyncio.run(main())