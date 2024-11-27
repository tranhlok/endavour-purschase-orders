from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Environment: local or prod
    ENVIRONMENT: str = "local"
    
    # AWS Credentials (can be dummy values for local dev)
    AWS_ACCESS_KEY_ID: str = "test"
    AWS_SECRET_ACCESS_KEY: str = "test"
    AWS_REGION: str = "us-east-1"
    
    # Service configurations
    DYNAMODB_TABLE_NAME: str = "purchase_orders"
    S3_BUCKET_NAME: str = "purchase-orders-docs"
    
    # LocalStack endpoint
    LOCALSTACK_ENDPOINT: str = "http://localhost:4566"

    class Config:
        env_file = ".env"

    @property
    def aws_endpoint_url(self) -> str:
        # Use container name as hostname when running in Docker
        return "http://localstack:4566" if self.ENVIRONMENT == "local" else None
@lru_cache()
def get_settings():
    return Settings()