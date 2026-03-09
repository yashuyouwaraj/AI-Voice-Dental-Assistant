import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateAvatar(name: string, gender: "MALE" | "FEMALE") {
  const seed = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (gender === "FEMALE") {
    // female avatars range 1–34
    return `https://i.pravatar.cc/300?img=${(seed % 34) + 1}`;
  }

  // male avatars range 35–70
  return `https://i.pravatar.cc/300?img=${(seed % 34) + 35}`;
}

// phone formatting function for India numbers
export const formatPhoneNumber = (value: string) => {
  if (!value) return value;

  const digits = value.replace(/[^\d]/g, "");
  let phoneNumber = digits;

  // Handle common India prefixes: +91 / 91 / leading 0
  if (phoneNumber.length > 10 && phoneNumber.startsWith("91")) {
    phoneNumber = phoneNumber.slice(2);
  }
  if (phoneNumber.length > 10 && phoneNumber.startsWith("0")) {
    phoneNumber = phoneNumber.slice(1);
  }

  phoneNumber = phoneNumber.slice(0, 10);

  if (phoneNumber.length <= 5) return phoneNumber;
  return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
};


