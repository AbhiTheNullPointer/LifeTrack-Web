import { Category, CategoryTone, Task } from '../types/todo';

export const CATEGORY_TONE_STYLES: Record<
  CategoryTone,
  { label: string; dotColor: string; textClass: string; iconBgClass: string }
> = {
  teal: {
    label: 'Mineral Teal',
    dotColor: '#1B6558',
    textClass: 'text-[#1B6558] dark:text-[#89D6C5]',
    iconBgClass: 'bg-[#C5EDE3] text-[#03201B] dark:bg-[#005145] dark:text-[#C5EDE3]',
  },
  blue: {
    label: 'Slate Blue',
    dotColor: '#36618E',
    textClass: 'text-[#36618E] dark:text-[#A0CAFD]',
    iconBgClass: 'bg-[#D1E4FF] text-[#001D36] dark:bg-[#194975] dark:text-[#D1E4FF]',
  },
  amber: {
    label: 'Ochre',
    dotColor: '#8B5A00',
    textClass: 'text-[#8B5A00] dark:text-[#F5BE5B]',
    iconBgClass: 'bg-[#FFDEA6] text-[#2B1700] dark:bg-[#694200] dark:text-[#FFDEA6]',
  },
  plum: {
    label: 'Plum',
    dotColor: '#6D5278',
    textClass: 'text-[#6D5278] dark:text-[#D9B8E6]',
    iconBgClass: 'bg-[#F3DAFF] text-[#271131] dark:bg-[#543B5F] dark:text-[#F3DAFF]',
  },
  rose: {
    label: 'Terracotta',
    dotColor: '#8E4A4A',
    textClass: 'text-[#8E4A4A] dark:text-[#F4B4B4]',
    iconBgClass: 'bg-[#FFDAD9] text-[#3B080A] dark:bg-[#713334] dark:text-[#FFDAD9]',
  },
  slate: {
    label: 'Stone',
    dotColor: '#52605C',
    textClass: 'text-[#52605C] dark:text-[#B8C7C2]',
    iconBgClass: 'bg-[#DCE5E1] text-[#131F1C] dark:bg-[#3A4844] dark:text-[#DCE5E1]',
  },
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work', tone: 'blue' },
  { id: 'cat-personal', name: 'Personal', tone: 'teal' },
  { id: 'cat-errands', name: 'Errands', tone: 'amber' },
  { id: 'cat-health', name: 'Health', tone: 'rose' },
  { id: 'cat-learning', name: 'Learning', tone: 'plum' },
];


// No seed tasks — the app starts empty so users begin with a clean slate.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createInitialTasks(): Task[] {
  return [];
}
