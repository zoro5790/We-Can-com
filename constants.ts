import { 
  BookOpen, 
  BrainCircuit, 
  MessageCircle, 
  Bot, 
  User, 
  Home,
  LogOut,
  Send,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Menu,
  ShieldAlert,
  BadgeCheck,
  Trash2,
  Edit2,
  Save,
  X,
  Bell,
  Search,
  Flag,
  Ban,
  EyeOff,
  Gavel,
  Unlock
} from 'lucide-react';

export const ICONS = {
  Lessons: BookOpen,
  Quizzes: BrainCircuit,
  Chat: MessageCircle,
  Assistant: Bot,
  Profile: User,
  User: User,
  Home: Home,
  Logout: LogOut,
  Send: Send,
  Upload: Upload,
  File: FileText,
  Alert: AlertTriangle,
  Check: CheckCircle,
  Menu: Menu,
  Admin: ShieldAlert,
  BrainCircuit: BrainCircuit,
  Verified: BadgeCheck,
  Delete: Trash2,
  Edit: Edit2,
  Save: Save,
  Cancel: X,
  Notification: Bell,
  Search: Search,
  Report: Flag,
  Block: Ban,
  Hide: EyeOff,
  Sanction: Gavel,
  Unlock: Unlock
};

export const ADMIN_EMAIL = "migde22.1223@gmail.com";
export const ADMIN_PASS = "557668866996";
export const DEVELOPER_EMAIL = "Shudochat79@gmail.com";
export const DEVELOPER_NAME = "مجدي أشرف";
export const APP_NAME = "We Can";

export const SCHOOL_DATA: Record<string, string[]> = {
  "مرحلة الأساس": [
    "الفصل الأول",
    "الفصل الثاني",
    "الفصل الثالث",
    "الفصل الرابع",
    "الفصل الخامس",
    "الفصل السادس"
  ],
  "المرحلة المتوسطة": [
    "الأول متوسط",
    "الثاني متوسط",
    "الثالث متوسط"
  ],
  "المرحلة الثانوية": [
    "الأول ثانوي",
    "الثاني ثانوي",
    "الثالث ثانوي"
  ]
};