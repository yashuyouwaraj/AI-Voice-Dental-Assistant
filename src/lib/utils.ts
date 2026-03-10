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


export const getNext5Days = () => {
  const dates = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 5; i++) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

export const getAvailableTimeSlots = () => {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];
};

export const APPOINTMENT_TYPES = [
  { id: "checkup", name: "Regular Checkup", duration: "60 min", price: "$120" },
  { id: "cleaning", name: "Teeth Cleaning", duration: "45 min", price: "$90" },
  { id: "consultation", name: "Consultation", duration: "30 min", price: "$75" },
  { id: "emergency", name: "Emergency Visit", duration: "30 min", price: "$150" },
];