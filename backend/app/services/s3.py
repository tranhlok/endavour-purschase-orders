import boto3
from ..config import get_settings

settings = get_settings()

class S3Service:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            endpoint_url=settings.aws_endpoint_url
        )
        self.bucket = settings.S3_BUCKET_NAME

    async def upload_file(self, file_data: bytes, file_name: str, order_id: str) -> str:
        key = f"{order_id}/{file_name}"
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=file_data
        )
        return key

    async def get_file_url(self, key: str) -> str:
        url = self.s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key},
            ExpiresIn=3600  # URL expires in 1 hour
        )
        return url
    
    async def upload_csv(self, csv_content: str, order_id: str) -> str:
        key = f"{order_id}/matches.csv"
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=csv_content.encode('utf-8'),
            ContentType='text/csv'
        )
        return key