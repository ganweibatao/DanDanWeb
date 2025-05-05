export const GRADE_CHOICES = [
  { value: 'primary_1', label: '小学一年级' },
  { value: 'primary_2', label: '小学二年级' },
  { value: 'primary_3', label: '小学三年级' },
  { value: 'primary_4', label: '小学四年级' },
  { value: 'primary_5', label: '小学五年级' },
  { value: 'primary_6', label: '小学六年级' },
  { value: 'junior_1', label: '初中一年级' },
  { value: 'junior_2', label: '初中二年级' },
  { value: 'junior_3', label: '初中三年级' },
  { value: 'senior_1', label: '高中一年级' },
  { value: 'senior_2', label: '高中二年级' },
  { value: 'senior_3', label: '高中三年级' },
  { value: 'college_1', label: '大学一年级' },
  { value: 'college_2', label: '大学二年级' },
  { value: 'college_3', label: '大学三年级' },
  { value: 'college_4', label: '大学四年级' },
  { value: 'graduate', label: '研究生' },
  { value: 'other', label: '其他' },
];

export const gradeMap: Record<string, string> = GRADE_CHOICES.reduce((acc, choice) => {
  acc[choice.value] = choice.label;
  return acc;
}, {} as Record<string, string>); 