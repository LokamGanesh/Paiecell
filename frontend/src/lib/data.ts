export type EventCategory = 
  | "YES+" 
  | "Sahaj" 
  | "DSN" 
  | "Advance Courses" 
  | "Fun & Knowledge" 
  | "Corporate Talks";

export type ItemType = "course" | "event";

export interface PAIEEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  category: EventCategory;
  type: ItemType;
  image?: string;
  registrationLink?: string;
  isExternal?: boolean;
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  yearOfStudy: string;
  eventId: string;
  createdAt: string;
}

export const CATEGORIES: EventCategory[] = [
  "YES+",
  "Sahaj",
  "DSN",
  "Advance Courses",
  "Fun & Knowledge",
  "Corporate Talks",
];

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  "YES+": "bg-category-yesplus",
  "Sahaj": "bg-category-sahaj",
  "DSN": "bg-category-dsn",
  "Advance Courses": "bg-category-advance",
  "Fun & Knowledge": "bg-category-fun",
  "Corporate Talks": "bg-category-corporate",
};

export const MOCK_EVENTS: PAIEEvent[] = [
  {
    id: "1",
    title: "YES+ Foundation Program",
    date: "2026-03-15",
    venue: "Main Auditorium, Block A",
    description: "A transformative program combining yoga, meditation, and leadership skills for college students.",
    category: "YES+",
    type: "course",
    isExternal: true,
    registrationLink: "https://www.artofliving.org/yes-plus",
  },
  {
    id: "2",
    title: "Sahaj Samadhi Meditation",
    date: "2026-03-22",
    venue: "Seminar Hall 2",
    description: "Learn effortless meditation technique that helps reduce stress and enhance clarity.",
    category: "Sahaj",
    type: "course",
  },
  {
    id: "3",
    title: "DSN - Divine Society Night",
    date: "2026-04-05",
    venue: "Campus Ground",
    description: "An evening of celebration, cultural performances, and community bonding.",
    category: "DSN",
    type: "course",
  },
  {
    id: "4",
    title: "Advance Meditation Retreat",
    date: "2026-04-12",
    venue: "Art of Living Center",
    description: "Deepen your practice with advanced breathing techniques and silent meditation.",
    category: "Advance Courses",
    type: "course",
  },
  {
    id: "5",
    title: "Stress-Free Study Workshop",
    date: "2026-03-10",
    venue: "Library Conference Room",
    description: "Fun interactive session on effective study techniques combined with breathing exercises.",
    category: "Fun & Knowledge",
    type: "event",
  },
  {
    id: "6",
    title: "Leadership in Corporate World",
    date: "2026-04-20",
    venue: "Business School, Room 301",
    description: "Industry leaders share insights on mindful leadership and career growth.",
    category: "Corporate Talks",
    type: "event",
  },
  {
    id: "7",
    title: "Happiness Program Preview",
    date: "2026-02-28",
    venue: "Open Air Theatre",
    description: "Experience a taste of the world-renowned Happiness Program with breathing and meditation.",
    category: "YES+",
    type: "course",
    isExternal: true,
    registrationLink: "https://www.artofliving.org/yes-plus",
  },
];
