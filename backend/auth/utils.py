# backend/auth/utils.py
# Central hub: re-export hashing + JWT utils

from .hashing import get_password_hash, verify_password
from .jwt_handler import create_access_token, decode_access_token

# Provide legacy alias for any callers still importing hash_password
hash_password = get_password_hash

__all__ = [
    "get_password_hash",
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
]
