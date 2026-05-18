// src/activity-log.ts - Activity logging helper

export interface LogEntry {
  projectId: string;
  message: string;
  createdAt: Date;
}

// Global in-memory logs
export const activityLogs: LogEntry[] = [];

// Log activity message
export function logActivity(projectId: string, message: string) {
  activityLogs.unshift({
    projectId,
    message,
    createdAt: new Date(),
  });

  if (activityLogs.length > 100) {
    activityLogs.pop();
  }
}
