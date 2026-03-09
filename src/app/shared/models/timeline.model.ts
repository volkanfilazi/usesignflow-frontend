export interface Timeline {
  time?: TimelineItems[];
  company: string;
  logo?: string;
  location: string;
  side: string;
  key: string;
  role: string;
  descriptions?: string[];
  date: string;
}

export interface TimelineItems {
  deadline?: string;
  date?: string;
  untilToday: string;
  type: string;
}
