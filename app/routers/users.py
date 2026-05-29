from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.deps import get_db
from app.models.user import UserProfile
from app.schemas.user import UserProfileCreate, UserProfileResponse
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserProfileResponse)
async def create_user(
    user_in: UserProfileCreate,
    db: AsyncSession = Depends(get_db)
):
    user = UserProfile(**user_in.model_dump())
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserProfile).where(UserProfile.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
