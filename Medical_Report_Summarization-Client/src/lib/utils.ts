import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";
  
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

export const getStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'done':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getAbnormalColor = (isAbnormal: boolean): string => {
  return isAbnormal 
    ? 'text-red-700 bg-red-50 border-red-200' 
    : 'text-green-700 bg-green-50 border-green-200';
};

export const truncateFileName = (fileName?: string | null, maxLength = 30): string => {
  if (!fileName) return '';
  if (fileName.length <= maxLength) return fileName;
  
  const extensionIndex = fileName.lastIndexOf('.');
  if (extensionIndex === -1) {
    return fileName.substring(0, maxLength / 2 - 2) + '...' + fileName.substring(fileName.length - (maxLength / 2) + 1);
  }
  
  const ext = fileName.substring(extensionIndex);
  const name = fileName.substring(0, extensionIndex);
  const charsToShow = maxLength - ext.length - 3;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  
  return name.substring(0, frontChars) + '...' + name.substring(name.length - backChars) + ext;
};

export const getInitials = (fullName?: string | null): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const calculateAge = (dateOfBirth?: string | null): number | null => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs); 
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};
