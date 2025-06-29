export const gcTimeConstant = 60 * 60 * 2;

const userRoleConstant = {
  student: 'student',
  lecturer: 'lecturer',
} as const;

const lecturerTitleArrayConstant = ['Prof', 'Dr', 'Engr', 'Mr', 'Mrs'] as const;

const lecturerTitleConstant = {
  prof: 'Prof',
  Dr: 'Dr',
  Eng: 'Engr',
  Mr: 'Mr',
  Mrs: 'Mrs',
} as const;

const yearLevelArrayConstant = ['100', '200', '300', '400', '500'] as const;

const studentYearLevelConstants = {
  100: yearLevelArrayConstant[0],
  200: yearLevelArrayConstant[1],
  300: yearLevelArrayConstant[2],
  400: yearLevelArrayConstant[3],
  500: yearLevelArrayConstant[4],
} as const;

export {
  userRoleConstant,
  lecturerTitleConstant,
  studentYearLevelConstants,
  yearLevelArrayConstant,
  lecturerTitleArrayConstant,
};
