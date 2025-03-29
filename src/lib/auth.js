import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import Admin from './models/admin';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function generateToken() {
  const token = nanoid(32);
  const jwt = await new SignJWT({ token })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secretKey);
  return { token, jwt };
}

export async function verifyAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin-token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const verified = await jwtVerify(token.value, secretKey);
    const admin = await Admin.findOne({
      'deviceTokens.token': verified.payload.token
    });

    if (!admin) {
      throw new Error('Invalid token');
    }

    return admin;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function isAdmin() {
  return verifyAuth().then(() => true).catch(() => false);
}