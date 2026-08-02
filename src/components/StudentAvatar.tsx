import React from 'react';
import { Student } from '../types.js';

interface StudentAvatarProps {
  student?: Partial<Student>;
  gender?: 'male' | 'female';
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  student,
  gender,
  title,
  size = 'md',
  className = ''
}) => {
  // Determine gender from student prop, gender prop, or title prefix
  const studentGender =
    gender ||
    student?.gender ||
    (student?.title === 'ด.ช.' || student?.title === 'นาย' || title === 'ด.ช.' || title === 'นาย'
      ? 'male'
      : 'female');

  const isBoy = studentGender === 'male';

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const iconSizes = {
    xs: { width: 18, height: 18 },
    sm: { width: 22, height: 22 },
    md: { width: 28, height: 28 },
    lg: { width: 34, height: 34 },
    xl: { width: 44, height: 44 }
  };

  const { width, height } = iconSizes[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 shadow-xs border-2 transition-transform duration-200 ${
        isBoy
          ? 'bg-gradient-to-b from-[#e8f4ff] to-[#cbe4ff] border-[#8bc7ff] text-[#2c78c7]'
          : 'bg-gradient-to-b from-[#fff0f5] to-[#fde0ed] border-[#f8a8cf] text-[#d64082]'
      } ${sizeClasses[size]} ${className}`}
      title={student ? `${student.title || ''}${student.firstName || ''} ${student.lastName || ''} (${student.nickname || ''})` : (isBoy ? 'นักเรียนชาย' : 'นักเรียนหญิง')}
    >
      {isBoy ? (
        /* Premium Boy Student Vector Icon */
        <svg
          width={width}
          height={height}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xs"
        >
          {/* Hair back / Base head shadow */}
          <circle cx="18" cy="16" r="10" fill="#FFE0C2" />
          {/* Boy Hair Top (Neat dark indigo/blue hair) */}
          <path
            d="M8.5 15C8.5 10 12 7.5 18 7.5C24 7.5 27.5 10 27.5 15C27.5 12 25 9.5 18 9.5C11 9.5 8.5 12 8.5 15Z"
            fill="#2D3B55"
          />
          <path
            d="M10 13C12 10.5 15.5 8.5 20 9C17 10 15 11.5 13 14L10 13Z"
            fill="#3B4C6E"
          />
          <path
            d="M9 16C9 10.5 13 8 18 8C23 8 27 10.5 27 16C27 14 24 11 18 11C12 11 9 14 9 16Z"
            fill="#2D3B55"
          />
          {/* Ears */}
          <circle cx="8" cy="16.5" r="2" fill="#FFCFAC" />
          <circle cx="28" cy="16.5" r="2" fill="#FFCFAC" />
          {/* Face Details */}
          {/* Eyes */}
          <circle cx="14.5" cy="16" r="1.3" fill="#2D3B55" />
          <circle cx="21.5" cy="16" r="1.3" fill="#2D3B55" />
          {/* Cute cheeks */}
          <ellipse cx="12.8" cy="18.2" rx="1.5" ry="0.8" fill="#FFAAA6" fillOpacity="0.6" />
          <ellipse cx="23.2" cy="18.2" rx="1.5" ry="0.8" fill="#FFAAA6" fillOpacity="0.6" />
          {/* Smile */}
          <path
            d="M16 19C16.8 19.8 19.2 19.8 20 19"
            stroke="#D9776E"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Student Collar & Shoulders */}
          <path
            d="M9 29.5C9 26 12 24 18 24C24 24 27 26 27 29.5V32H9V29.5Z"
            fill="#306385"
          />
          {/* White School Shirt Collar */}
          <path
            d="M14 24L18 27.5L22 24L20 24.5L18 26.5L16 24.5L14 24Z"
            fill="#FFFFFF"
          />
          <path
            d="M13.5 24.5L18 29L22.5 24.5"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        /* Premium Girl Student Vector Icon */
        <svg
          width={width}
          height={height}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xs"
        >
          {/* Girl Hair back / Ponytails */}
          <circle cx="8" cy="18" r="3.5" fill="#3D2E39" />
          <circle cx="28" cy="18" r="3.5" fill="#3D2E39" />
          {/* Base head */}
          <circle cx="18" cy="16" r="9.5" fill="#FFE0C2" />
          {/* Ears */}
          <circle cx="8.5" cy="16.5" r="1.8" fill="#FFCFAC" />
          <circle cx="27.5" cy="16.5" r="1.8" fill="#FFCFAC" />
          {/* Girl Hair Top & Cute Bangs */}
          <path
            d="M8.5 16C8.5 10 12.5 7.5 18 7.5C23.5 7.5 27.5 10 27.5 16C27.5 12 25 9.5 18 9.5C11 9.5 8.5 12 8.5 16Z"
            fill="#3D2E39"
          />
          <path
            d="M10 14C12.5 11 16 10 19 12C16 11 13 12 11 15L10 14Z"
            fill="#54404E"
          />
          <path
            d="M18 9.5C21 11 23 13 25 15C24 13 22 11 19 10L18 9.5Z"
            fill="#54404E"
          />
          {/* Cute Pink Headband/Ribbon accent */}
          <path
            d="M11 10.5C14 8.8 22 8.8 25 10.5"
            stroke="#E86E9A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Face Details */}
          {/* Eyes with eyelashes */}
          <circle cx="14.5" cy="16" r="1.3" fill="#3D2E39" />
          <circle cx="21.5" cy="16" r="1.3" fill="#3D2E39" />
          {/* Cute rosy cheeks */}
          <ellipse cx="12.5" cy="18.2" rx="1.6" ry="0.9" fill="#FF8E9E" fillOpacity="0.65" />
          <ellipse cx="23.5" cy="18.2" rx="1.6" ry="0.9" fill="#FF8E9E" fillOpacity="0.65" />
          {/* Smile */}
          <path
            d="M16 19C16.8 19.8 19.2 19.8 20 19"
            stroke="#D9667F"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Student Collar & Shoulders */}
          <path
            d="M9.5 29.5C9.5 26 12.5 24 18 24C23.5 24 26.5 26 26.5 29.5V32H9.5V29.5Z"
            fill="#C44B7D"
          />
          {/* White School Blouse Collar with cute pink tie/ribbon */}
          <path
            d="M13.5 24L18 27.5L22.5 24L20 24.5L18 26.5L16 24.5L13.5 24Z"
            fill="#FFFFFF"
          />
          <circle cx="18" cy="27.5" r="1.5" fill="#E86E9A" />
        </svg>
      )}
    </div>
  );
};
