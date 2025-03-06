import { User } from "@prisma/client";

// Representasi rules format out come operasi
export type UserOperationOutcome = {
  readonly id: number;
  readonly username: string;
  readonly email: string;
};

// Request untuk user register
export type RegisterRequest = {
  readonly username: string;
  readonly email: string;
  readonly password: string;
};

// Request untuk user login
export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

// Request untuk user update
export type UpdateRequest = {
  readonly id: number;
  readonly username: string;
  readonly email: string;
};

// Request untuk ganti password
export type ChangePasswordRequest = {
  readonly userId: number;
  readonly oldPassword: string;
  readonly currentPassword: string;
  readonly newPassword: string;
};

// Representasi untuk konversi user payload, ke format yang sesuai
export function convertToUserResponseOutcome(
  userPayload: User
): UserOperationOutcome {
  return {
    id: userPayload.id,
    username: userPayload.username,
    email: userPayload.email,
  };
}
