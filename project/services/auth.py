import bcrypt
from jose import jwt
from datetime import datetime, timedelta


SECRET_KEY = "learnai-super-secret-key-change-later"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError("Password must be 72 bytes or less")

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    return bcrypt.checkpw(
        password_bytes,
        hashed_bytes
    )


def create_access_token(user_id: int):
    expire = datetime.utcnow() + timedelta(hours=24)

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from database import get_db
from models.user import User
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)




def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        print(
    "TOKEN DEBUG:",
    token[:30],
    "...",
    "SEGMENTS:",
    len(token.split("."))
)
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("JWT PAYLOAD:", payload)

        user_id = payload.get("sub")

        if user_id is None:
            print("JWT ERROR: sub missing")
            raise credentials_exception

    except JWTError as e:
        print("JWT DECODE ERROR:", e)
        raise credentials_exception

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if user is None:
        print("USER NOT FOUND:", user_id)
        raise credentials_exception

    print("CURRENT USER:", user.id, user.email)

    return user