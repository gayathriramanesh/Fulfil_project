from pydantic import BaseModel
from datetime import datetime


# ------------------ File schemas ------------------
class FileBase(BaseModel):
    filename: str


class FileCreate(FileBase):
    pass


class FileResponse(FileBase):
    id: int
    uploaded_at: datetime
    status: str

    class Config:
        from_attributes = True
