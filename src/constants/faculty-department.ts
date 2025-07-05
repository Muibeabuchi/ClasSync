export const facultyDepartmentMap = [
  {
    'School of Electrical Systems and Engineering Technology (SESET)': [
      'Computer Engineering',
      'Electrical (Power Systems) Engineering',
      'Electronics Engineering',
      'Mechatronics Engineering',
      'Telecommunications Engineering',
    ],
  },
  {
    'School of Engineering and Engineering Technology (SEET)': [
      'Agricultural and Bio resources Engineering',
      'Biomedical Engineering',
      'Chemical Engineering',
      'Civil Engineering',
      'Food Science and technology',
      'Material and Metallurgical Engineering',
      'Mechanical Engineering',
      'Petroleum Engineering',
      'Polymer and Textile Engineering',
    ],
  },
  {
    'School of Physical Science (SOPS)': [
      'Chemistry',
      'Geology',
      'Mathematics',
      'Physics',
      'Science Laboratory Technology',
      'Statistics',
    ],
  },
  {
    'School of Logistics and Innovation Technology (SLIT)': [
      'Entrepreneurship and Innovation',
      'Logistics and Transport Technology',
      'Maritime Technology and Logistics',
      'Supply Chain Management',
      'Project Management Technology',
    ],
  },
  {
    'School of Biological Science (SOBS)': [
      'Biochemistry',
      'Biology',
      'Biotechnology',
      'Microbiology',
      'Forensic Science',
      'Electrical and Electronic Engineering',
    ],
  },
  {
    'School of Information and Communication Technology (SICT)': [
      'Computer Science',
      'Cyber Security',
      'Information Technology',
      'Software Engineering',
    ],
  },
  {
    'School of Basic Medical Science (SBMS)': [
      'Human Anatomy',
      'Human Physiology',
    ],
  },
  {
    'School of Health Technology (SOHT)': [
      'Dental Technology',
      'Environmental Health Science',
      'Optometry',
      'Prosthetics and Orthotics',
      'Public Health Technology',
    ],
  },
  {
    'School of Agriculture And Agricultural Technology (SAAT)': [
      'Agribusiness',
      'Agricultural Economics',
      'Agricultural Extension',
      'Animal Science and Technology',
      'Crop Science and Technology',
      'Fisheries and Aquaculture Technology',
      'Forestry and Wildlife Technology',
      'Soil Science and Technology',
    ],
  },
];

export const getFaculties = () => {
  return facultyDepartmentMap.map((item) => Object.keys(item)[0]);
};

export const getDepartmentsByFaculty = (faculty: string) => {
  const facultyObj = facultyDepartmentMap.find(
    (item) => Object.keys(item)[0] === faculty,
  );
  return facultyObj ? Object.values(facultyObj)[0] : [];
};
