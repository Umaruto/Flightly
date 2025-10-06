import argparse
import os
import sys

# Ensure the 'app' package can be imported when run from Backend/
CURRENT_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, os.pardir))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password


def upsert_admin(name: str, email: str, password: str) -> User:
    email = email.lower().strip()
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Promote to admin and reset password
            user.name = name or user.name
            user.password_hash = hash_password(password)
            user.role = UserRole.ADMIN
            user.is_active = True
            db.commit()
            db.refresh(user)
            return user
        # Create new admin
        user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


def main():
    parser = argparse.ArgumentParser(description="Create or promote an admin user.")
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    user = upsert_admin(args.name, args.email, args.password)
    print(f"Admin ready: id={user.id} email={user.email} role={user.role}")


if __name__ == "__main__":
    main()
