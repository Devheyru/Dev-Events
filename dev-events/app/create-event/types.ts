export type EventForm = {
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or human
  mode: "online" | "offline" | "hybrid";
  audience: string;
  organizer: string;
  tags: string; // comma-separated input from user
  agenda: string; // newline-separated input from user
  image?: File | null;
};
