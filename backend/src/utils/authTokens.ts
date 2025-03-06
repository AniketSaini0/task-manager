import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const hashedPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
  return password;
};
