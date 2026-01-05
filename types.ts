export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  MUTED = 'MUTED',   // Can't send messages
  BANNED = 'BANNED'  // Can't login
}

export interface NotificationPreferences {
  chat: boolean;
  announcements: boolean;
}

export interface ViolationRecord {
  date: number;
  type: 'WARNING' | 'MUTE' | 'BAN';
  reason: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  stage?: string;
  grade?: string;
  password?: string;
  schoolInfo?: {
    schoolName: string;
    classroom: string;
  };
  preferences?: NotificationPreferences;
  currentRoomId?: string;
  
  // Security & Discipline
  status: UserStatus;
  blockedUsers: string[]; // List of IDs blocked by this user
  violations: ViolationRecord[]; // History of sanctions
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export enum ReportReason {
  ABUSE = 'إساءة أو سلوك غير لائق',
  NON_EDUCATIONAL = 'محتوى غير تعليمي',
  SPAM = 'إزعاج أو رسائل مكررة',
  IMPERSONATION = 'انتحال شخصية',
  OTHER = 'سبب آخر'
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  
  reportedId: string; // The user being reported
  reportedName: string;
  reportedEmail: string;
  
  reason: ReportReason | string;
  description?: string;
  date: string;
  timestamp: number;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export enum AppView {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  SUDANESE_FORM = 'SUDANESE_FORM',
  HOME = 'HOME',
  LESSONS = 'LESSONS',
  QUIZZES = 'QUIZZES',
  CHAT = 'CHAT',
  AI_ASSISTANT = 'AI_ASSISTANT',
  ADMIN = 'ADMIN',
  PROFILE = 'PROFILE'
}