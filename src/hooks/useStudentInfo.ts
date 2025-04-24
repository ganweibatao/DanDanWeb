import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { teacherService } from '../services/teacherApi';
import { Student } from '../services/teacherApi'; // Assuming Student type is exported from schoolApi

const STUDENT_INFO_QUERY_KEY = 'studentInfo';

// Define the type for the query key
type StudentInfoQueryKey = [string, number | undefined];

// Explicitly type the query function using the existing service
const fetchStudentInfoQueryFn = async ({ queryKey }: QueryFunctionContext<StudentInfoQueryKey>): Promise<Student | null> => {
  const [, id] = queryKey;
  if (!id) {
    return null;
  }
  try {
    return await teacherService.getStudentById(id);
  } catch (error) {
    throw error; // Re-throw error so useQuery catches it
  }
};

// Adapt the return type to match the hook's purpose (maybe map Student -> desired shape)
// For now, just return the raw data and loading/error states
export function useStudentInfo(studentId?: string | number | null) {
  const id = studentId ? Number(studentId) : undefined;

  // Use v5 object syntax for useQuery
  const {
    data: studentData,
    isLoading: isLoadingStudent,
    error: studentError, // This error will be of type Error | null
  } = useQuery<Student | null, Error, Student | null, StudentInfoQueryKey>({
    queryKey: [STUDENT_INFO_QUERY_KEY, id],
    queryFn: fetchStudentInfoQueryFn,
    enabled: !!id,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    // Use placeholderData with keepPreviousData function
    placeholderData: keepPreviousData, 
  });

  // Map the raw studentData to the previously expected { name, email } structure if needed
  const studentInfo = studentData ? {
      name: studentData.name || null,
      email: studentData.email || null,
      // Add other fields if needed
  } : null;

  return {
    studentInfo, // Return the mapped info
    isLoadingStudent,
    studentError, // Return the Error object or null
    // Raw data is available via studentData if needed outside the hook, but not returning it by default
  };
} 