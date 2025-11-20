from sqlalchemy import Column, Integer, String, DateTime, func, Text, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, relationship
from app.db.database import Base
from sqlalchemy.orm import mapped_column



class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    s3_path: Mapped[str | None] = mapped_column(String)
    uploaded_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    status: Mapped[str] = mapped_column(String, default="pending")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    file_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("files.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    sku: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[float | None] = mapped_column(Numeric(12, 2))
    quantity: Mapped[int | None] = mapped_column(Integer)
    category: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    # Optional: relationship to File (handy for queries)
    file = relationship("File")

class StagingProduct(Base):
    __tablename__ = "staging_products"
    __table_args__ = {"prefixes": ["UNLOGGED"]}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    sku: Mapped[str | None] = mapped_column(Text)
    name: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[float | None] = mapped_column(Numeric(12, 2))
    quantity: Mapped[int | None] = mapped_column(Integer)
    category: Mapped[str | None] = mapped_column(Text)
