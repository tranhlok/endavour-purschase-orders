from fastapi import APIRouter, HTTPException, Body
from typing import List
from ..services.dynamodb import DynamoDBService
from ..models.order_item import OrderItem, OrderItemCreate
import uuid
from datetime import datetime
import csv
import io
from ..services.s3 import S3Service

router = APIRouter()
dynamodb_service = DynamoDBService()
s3_service = S3Service()

@router.post("/orders/{order_id}/items", response_model=List[OrderItem])
async def create_order_items(order_id: str, items: List[OrderItemCreate]):
    """
    Create or update multiple order items for a specific order.
    If an item with the same order_id and request_item exists, it will be updated.
    
    Request body example:
    [
        {
            "request_item": "Brass Nut 1/2\" 20mm Galvan",
            "quantity": 36,
            "uom": "ea",
            "price_per_unit": 11.48,
            "amount": 413.28
        },
        ...
    ]
    """
    try:
        created_items = []
        for item in items:
            # Check if item already exists
            existing_item = await dynamodb_service.get_order_item_by_name(
                order_id, 
                item.request_item
            )
            
            if existing_item:
                # Update existing item
                updated_item = await dynamodb_service.update_order_item(
                    existing_item['item_id'],
                    order_id,
                    item.model_dump()
                )
                created_items.append(updated_item)
            else:
                # Create new item
                item_data = OrderItem(
                    order_id=order_id,
                    item_id=str(uuid.uuid4()),
                    **item.model_dump()
                )
                created_item = await dynamodb_service.create_order_item(item_data)
                created_items.append(created_item)
                
        return created_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}/items", response_model=List[OrderItem])
async def get_order_items(order_id: str):
    """
    Get all items for a specific order.
    """
    try:
        items = await dynamodb_service.get_order_items(order_id)
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/orders/{order_id}/items/matches", response_model=List[OrderItem])
async def update_multiple_items(
    order_id: str,
    updates: List[dict] = Body(...)
):
    """
    Update multiple items in an order including all editable fields.
    
    Request body example:
    [
        {
            "item_id": "item1",
            "request_item": "Updated Item Name",
            "quantity": 10,
            "uom": "boxes",
            "price_per_unit": "15.00",
            "amount": "150.00",
            "match": "matches"  # Note: field name is 'matches' in DB
        }
    ]
    """
    try:
        # Update items in DynamoDB
        updated_items = []
        for update in updates:
            item_id = update.pop('item_id')  # Remove item_id from updates dict
            
            # Convert 'match' field to 'matches' if present
            if 'match' in update:
                update['matches'] = update.pop('match')
                
            item = await dynamodb_service.update_order_item(
                item_id=item_id,
                order_id=order_id,
                update_data=update
            )
            updated_items.append(item)

        # Generate and save CSV
        all_items = await dynamodb_service.get_all_order_items_for_csv(order_id)
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['Item ID', 'Request Item', 'Quantity', 'UOM', 'Price Per Unit', 'Amount', 'Match'])
        
        for item in all_items:
            writer.writerow([
                item.get('item_id', ''),
                item.get('request_item', ''),
                item.get('quantity', ''),
                item.get('uom', ''),
                item.get('price_per_unit', ''),
                item.get('amount', ''),
                item.get('matches', '')  # Note: using 'matches' from DB
            ])
        
        csv_content = output.getvalue()
        await s3_service.upload_csv(csv_content, order_id)
        
        return updated_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))