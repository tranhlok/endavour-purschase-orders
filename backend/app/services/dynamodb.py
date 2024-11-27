import boto3
from datetime import datetime
from ..config import get_settings
from fastapi import HTTPException
from botocore.exceptions import ClientError
from typing import List
from ..models.order_item import OrderItem, OrderItemCreate
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal

settings = get_settings()

class DynamoDBService:
    def __init__(self):
        self.dynamodb = boto3.resource(
            'dynamodb',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            endpoint_url=settings.aws_endpoint_url
        )
        self.orders_table = self.dynamodb.Table(settings.DYNAMODB_TABLE_NAME)
        self.items_table = self.dynamodb.Table('order_items')

    async def create_order(self, order_data: dict) -> dict:
        item = {
            'id': str(order_data['id']),
            'date': str(order_data['date']),
            'status': str(order_data['status']),
            'request_file': str(order_data['request_file']),
            'created_at': str(order_data['created_at']),
            'updated_at': str(order_data['updated_at'])
        }
        
        try:
            self.orders_table.put_item(Item=item)
            return order_data
        except ClientError as e:
            print(f"DynamoDB error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))        
        
        
    async def get_orders(self, filter_type: str = None) -> list:
        if filter_type and filter_type != 'all':
            response = self.orders_table.scan(
                FilterExpression='#type = :type_val',
                ExpressionAttributeNames={'#type': 'type'},
                ExpressionAttributeValues={':type_val': filter_type}
            )
        else:
            response = self.orders_table.scan()
        
        return response['Items']

    async def search_orders(self, query: str) -> list:
        # Note: DynamoDB doesn't support native full-text search
        # For production, consider using OpenSearch or similar
        response = self.orders_table.scan()
        items = response['Items']
        
        return [
            item for item in items
            if query.lower() in str(item.get('id', '')).lower() or
               query.lower() in str(item.get('type', '')).lower() or
               query.lower() in str(item.get('date', '')).lower()
        ]

    async def update_order_status(self, order_id: str, new_status: str) -> dict:
        try:
            response = self.orders_table.update_item(
                Key={'id': order_id},
                UpdateExpression='SET #status = :status, updated_at = :timestamp',
                ExpressionAttributeNames={
                    '#status': 'status'
                },
                ExpressionAttributeValues={
                    ':status': new_status,
                    ':timestamp': datetime.utcnow().isoformat()
                },
                ReturnValues='ALL_NEW'
            )
            
            # Get the complete item after update
            get_response = self.orders_table.get_item(
                Key={'id': order_id},
                ConsistentRead=True
            )
            
            return get_response.get('Item', {})
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )

    async def create_order_item(self, item: OrderItem) -> dict:
        try:
            item_dict = item.model_dump()
            self.items_table.put_item(Item=item_dict)
            return item_dict
        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_order_items(self, order_id: str) -> List[dict]:
        try:
            response = self.items_table.query(
                KeyConditionExpression='order_id = :order_id',
                ExpressionAttributeValues={
                    ':order_id': order_id
                }
            )
            return response['Items']
        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_order_item_by_name(self, order_id: str, request_item: str) -> dict:
        try:
            response = self.items_table.query(
                KeyConditionExpression='order_id = :order_id',
                FilterExpression='request_item = :request_item',
                ExpressionAttributeValues={
                    ':order_id': order_id,
                    ':request_item': request_item
                }
            )
            items = response.get('Items', [])
            return items[0] if items else None
        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def update_order_item(self, item_id: str, order_id: str, update_data: dict) -> dict:
        try:
            update_expr = 'SET '
            expr_names = {}
            expr_values = {}
            
            # Build update expression dynamically
            for key, value in update_data.items():
                if key not in ['order_id', 'item_id']:  # Skip keys that can't be updated
                    update_expr += f'#{key} = :{key}, '
                    expr_names[f'#{key}'] = key
                    expr_values[f':{key}'] = value

            # Add updated_at timestamp
            update_expr += '#updated_at = :updated_at'
            expr_names['#updated_at'] = 'updated_at'
            expr_values[':updated_at'] = datetime.utcnow().isoformat()

            response = self.items_table.update_item(
                Key={
                    'order_id': order_id,
                    'item_id': item_id
                },
                UpdateExpression=update_expr,
                ExpressionAttributeNames=expr_names,
                ExpressionAttributeValues=expr_values,
                ReturnValues='ALL_NEW'
            )
            return response['Attributes']
        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def update_item_match(self, order_id: str, item_id: str, match: str) -> dict:
        try:
            response = self.items_table.update_item(
                Key={
                    'order_id': order_id,
                    'item_id': item_id
                },
                UpdateExpression='SET #matches = :match, #updated_at = :timestamp',
                ExpressionAttributeNames={
                    '#matches': 'matches',
                    '#updated_at': 'updated_at'
                },
                ExpressionAttributeValues={
                    ':match': match,
                    ':timestamp': datetime.utcnow().isoformat()
                },
                ReturnValues='ALL_NEW'
            )
            return response['Attributes']
        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_all_order_items_for_csv(self, order_id: str) -> List[dict]:
        try:
            response = self.items_table.query(
                KeyConditionExpression='order_id = :order_id',
                ExpressionAttributeValues={
                    ':order_id': order_id
                }
            )
            return sorted(response['Items'], key=lambda x: x.get('item_id', ''))
        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))