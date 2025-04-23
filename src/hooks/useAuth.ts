import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

// Define possible user roles
export type UserRole = 'student' | 'teacher' | 'admin' | 'unknown' | null;

// Define the shape of the user data you expect from the backend
interface UserData {
    id: number;
    username: string;
    email: string;
    // Add fields that indicate the role, examples:
    role?: 'student' | 'teacher' | 'admin'; // If you have a direct role field
    is_student?: boolean; // If role is indicated by boolean flags
    is_teacher?: boolean;
    student_profile?: { id: number; /* other student fields */ }; // Keep if other profile details are nested
    teacher_profile?: { id: number; /* other teacher fields */ }; // Keep if other profile details are nested
    student_profile_id?: number; // Add ID field from backend
    teacher_profile_id?: number; // Add ID field from backend
    user_type?: UserRole; // Added for the new role logic
    is_staff?: boolean; // Added for the new role logic
    // Add any other relevant user fields
}

// Define the return type of the hook
interface AuthState {
    isAuthenticated: boolean;
    user: UserData | null;
    userRole: UserRole;
    isLoading: boolean;
    error: string | null;
}

// The custom hook
export const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        userRole: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const checkAuthStatus = async () => {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
            try {
                const response = await apiClient.get<UserData>('accounts/users/current/');
                if (response.data) {
                    const userData = response.data;
                    let determinedRole: UserRole = null;
                    // Prioritize user_type from backend if available
                    if (userData.user_type && ['student', 'teacher', 'admin'].includes(userData.user_type)) {
                        determinedRole = userData.user_type as UserRole;
                    } else if (userData.role) { // Fallback to role field
                        determinedRole = userData.role;
                    } else if (userData.teacher_profile || userData.teacher_profile_id) { // Fallback to profile existence or ID
                        determinedRole = 'teacher';
                    } else if (userData.student_profile || userData.student_profile_id) { // Fallback to profile existence or ID
                        determinedRole = 'student';
                    } else if (userData.is_staff) { // Fallback to is_staff
                        determinedRole = 'admin';
                    } else {
                        determinedRole = 'unknown'; // Default if no role indicator found
                    }
                    setAuthState({
                        isAuthenticated: true,
                        user: userData,
                        userRole: determinedRole,
                        isLoading: false,
                        error: null,
                    });
                } else {
                    // Handle case where response has data but it's empty or unexpected
                    // This might happen if API returns 200 OK with empty body for non-logged in users
                    // depending on backend implementation.
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        userRole: null,
                        isLoading: false,
                        error: "Authentication successful but no user data received.",
                    });
                    // throw new Error("User data not found in response."); // Original line
                }
            } catch (error: any) {
                // Handle specific error statuses if needed (e.g., 401 Unauthorized)
                const errorMessage = error?.response?.data?.detail || // Django REST framework default error message
                                   error?.response?.data?.error ||   // Custom error message field
                                   error.message ||                 // Generic error message
                                   "Failed to verify authentication.";
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    userRole: null,
                    isLoading: false,
                    error: errorMessage,
                });
            }
        };
        checkAuthStatus();
    }, []);

    return authState;
};
