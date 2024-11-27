import boto3
import os
import sys
from botocore.exceptions import ClientError

# Initialize DynamoDB
dynamodb = boto3.client('dynamodb',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

# Initialize S3
s3 = boto3.client('s3',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

def init_services():
    # Create DynamoDB table
    try:
        dynamodb.create_table(
            TableName='purchase_orders',
            KeySchema=[
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'id', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print("Created DynamoDB table: purchase_orders")
        
        # Wait for table to be created
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName='purchase_orders')
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("DynamoDB table already exists")
        else:
            print(f"Error creating DynamoDB table: {str(e)}")

    # Create S3 bucket
    try:
        s3.create_bucket(Bucket='purchase-orders-docs')
        print("Created S3 bucket: purchase-orders-docs")
    except ClientError as e:
        if e.response['Error']['Code'] == 'BucketAlreadyExists':
            print("S3 bucket already exists")
        else:
            print(f"Error creating S3 bucket: {str(e)}")

    # Create order items table
    try:
        dynamodb.create_table(
            TableName='order_items',
            KeySchema=[
                {'AttributeName': 'order_id', 'KeyType': 'HASH'},
                {'AttributeName': 'item_id', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'order_id', 'AttributeType': 'S'},
                {'AttributeName': 'item_id', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print("Created DynamoDB table: order_items")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("Order items table already exists")
        else:
            print(f"Error creating order items table: {str(e)}")

if __name__ == "__main__":
    init_services()