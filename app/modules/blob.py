import io
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient

from app.core.config import settings

CONTAINER_NAME = settings.AZURE_BLOB_CONTAINER


def _get_blob_property(blob_cilent: BlobClient):
    return blob_cilent.get_blob_properties()


def upload_blob_stream(
    blob_service: BlobServiceClient,
    blob_name: str,
    blob_buffer: io.BytesIO,
    container_name: str = CONTAINER_NAME
):
    blob_client = blob_service.get_blob_client(
        container=CONTAINER_NAME, 
        blob=blob_name
    )
    input_stream = blob_buffer
    blob_client.upload_blob(input_stream, blob_type="BlockBlob")

    try:
        meta= _get_blob_property(blob_client)
    except Exception as e:
        print(e)
        return None
    
    return meta


def download_blob_to_stream(
    blob_service: BlobServiceClient,
    blob_name: str,
    container_name: str = CONTAINER_NAME
):
    blob_client = blob_service.get_blob_client(
        container=CONTAINER_NAME, 
        blob=blob_name
    )

    try:
        bytes = blob_client.download_blob().readall()
        stream = io.BytesIO(bytes)
        stream.seek(0)
    except Exception as e:
        print(e)
        return None

    return stream


def delete_blob(
    blob_service: BlobServiceClient, 
    blob_name: str,
    container_name: str = CONTAINER_NAME
):
    blob_client = blob_service.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
    blob_client.delete_blob()

    try:
        _get_blob_property(blob_client)
    except Exception as e:
        return None