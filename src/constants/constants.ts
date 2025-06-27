export const gcTimeConstant = 60 * 60 * 2;

const userRoleConstant = {
  student: 'student',
  lecturer: 'lecturer',
} as const;

const lecturerTitleConstant = {
  prof: 'Prof',
  Dr: 'Dr',
  Eng: 'Engr',
  Mr: 'Mr',
  Mrs: 'Mrs',
} as const;

const studentYearLevelConstants = {
  100: 100,
  200: 200,
  300: 300,
  400: 400,
  500: 500,
  600: 600,
} as const;

export { userRoleConstant, lecturerTitleConstant, studentYearLevelConstants };
