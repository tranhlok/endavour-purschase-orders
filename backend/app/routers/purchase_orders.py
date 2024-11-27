from typing import Optional, Dict, List
from datetime import datetime
import time
from fastapi import APIRouter, UploadFile, File, Query, HTTPException, Body
from ..services.dynamodb import DynamoDBService
from ..services.s3 import S3Service
from ..models.purchase_order import StatusUpdate
from ..models.order_item import OrderItem
import logging
router = APIRouter()
dynamodb_service = DynamoDBService()
s3_service = S3Service()

@router.post("/orders")
async def create_order(
    request_file: UploadFile = File(...)
):
    try:
        # Generate order ID using timestamp
        order_id = str(int(time.time() * 1000))
        
        # Read file content
        file_content = await request_file.read()
        
        # Upload request file to S3
        request_key = await s3_service.upload_file(
            file_content,
            request_file.filename,
            order_id
        )

        # Create order in DynamoDB
        order_data = {
            "id": str(order_id),
            "date": datetime.now().strftime("%m/%d/%Y"),
            "status": "Processing",
            "request_file": str(request_key),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        order = await dynamodb_service.create_order(order_data)
        return order
        
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders")
async def get_orders(
    filter_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    if search:
        orders = await dynamodb_service.search_orders(search)
    else:
        orders = await dynamodb_service.get_orders(filter_type)
    return orders

@router.get("/orders/{order_id}/files/{file_type}")
async def get_file_url(order_id: str, file_type: str):
    key = f"{order_id}/{file_type}"
    url = await s3_service.get_file_url(key)
    return {"url": url}

@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: StatusUpdate = Body(...)  # Explicitly use Body for request body
):
    logging.info(f"Received status update request - order_id: {order_id}")
    logging.info(f"Status update payload: {status_update}")
    logging.info(f"New status value: {status_update.status}")

    try:
        updated_order = await dynamodb_service.update_order_status(
            order_id, 
            status_update.status
        )
        logging.info(f"Successfully updated order: {updated_order}")
        return updated_order
    except Exception as e:
        logging.error(f"Error updating order status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update order status: {str(e)}"
        )

@router.get("/orders/{order_id}/matches-csv")
async def get_matches_csv_url(order_id: str):
    """
    Get a pre-signed URL for downloading the matches CSV file.
    """
    try:
        key = f"{order_id}/matches.csv"
        url = await s3_service.get_file_url(key)
        return {"url": url}
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail="Matches CSV file not found"
        )
