import base64
from pathlib import Path
from py_vapid import Vapid
from cryptography.hazmat.primitives import serialization

v = Vapid()
v.generate_keys()

raw_pub = v.public_key.public_bytes(
    serialization.Encoding.X962,
    serialization.PublicFormat.UncompressedPoint
)
pub_b64 = base64.urlsafe_b64encode(raw_pub).decode().rstrip("=")

raw_priv = v.private_key.private_numbers().private_value.to_bytes(32, byteorder='big')
priv_b64 = base64.urlsafe_b64encode(raw_priv).decode().rstrip("=")

print(f"Generated VAPID Keys:")
print(f"VAPID_PUBLIC_KEY={pub_b64}")
print(f"VAPID_PRIVATE_KEY={priv_b64}")

env_file = Path(".env")
if env_file.exists():
    content = env_file.read_text(encoding="utf-8")
    lines = content.splitlines()
    new_lines = []
    for line in lines:
        if line.startswith("VAPID_PUBLIC_KEY="):
            new_lines.append(f"VAPID_PUBLIC_KEY={pub_b64}")
        elif line.startswith("VAPID_PRIVATE_KEY="):
            new_lines.append(f"VAPID_PRIVATE_KEY={priv_b64}")
        else:
            new_lines.append(line)
    env_file.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    print("Successfully updated .env with generated VAPID keys!")
