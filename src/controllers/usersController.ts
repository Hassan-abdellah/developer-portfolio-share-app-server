import { prisma } from "../lib/prisma";
import { ClerkUserData } from "../types";

export async function saveUserToDB(data: ClerkUserData) {
  await prisma.user.create({
    data: {
      clerkId: data.id, // store Clerk's ID as reference
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      avatar: data.image_url,
    },
  });
}

export async function updateUserInDB(data: ClerkUserData) {
  await prisma.user.update({
    where: { clerkId: data.id },
    data: {
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      avatar: data.image_url,
    },
  });
}

export async function deleteUserFromDB(clerkId: string) {
  await prisma.user.delete({ where: { clerkId } });
}
