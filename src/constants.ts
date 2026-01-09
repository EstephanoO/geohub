
export const accessToken = 'pk.eyJ1IjoibGVvbmFyZG9sb2xvIiwiYSI6ImNtaXkwZzc0ZzBicHczaW9vbHkxdW9tMWMifQ.6JqnhbxqVA8W-qvocIeerQ'

export const AUTH_CREDENTIALS = {
  email: "admin@geohub.com",
  password: "admin123",
} as const;

export const JWT_CONFIG = {
  secret: "supersecret_jwt_key_for_development",
  expiresIn: "7d",
} as const;
