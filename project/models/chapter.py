from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False)