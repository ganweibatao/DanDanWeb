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
                // Add no-cache headers to this specific request
                const response = await apiClient.get<UserData>('accounts/users/current/', {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                if (response.data && Object.keys(response.data).length > 0) { // Check if response.data is not empty
                    const userData = response.data;
                    let determinedRole: UserRole = null;
                    if (userData.user_type && ['student', 'teacher', 'admin'].includes(userData.user_type)) {
                        determinedRole = userData.user_type as UserRole;
                    } else if (userData.role) {
                        determinedRole = userData.role;
                    } else if (userData.teacher_profile || userData.teacher_profile_id) {
                        determinedRole = 'teacher';
                    } else if (userData.student_profile || userData.student_profile_id) {
                        determinedRole = 'student';
                    } else if (userData.is_staff) {
                        determinedRole = 'admin';
                    } else {
                        determinedRole = 'unknown';
                    }
                    setAuthState({
                        isAuthenticated: true,
                        user: userData,
                        userRole: determinedRole,
                        isLoading: false,
                        error: null,
                    });
                } else {
                    // If response.data is empty or not what we expect, treat as not authenticated
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        userRole: null,
                        isLoading: false,
                        error: response.data ? "User data received but was empty or in an unexpected format." : "No user data received.",
                    });
                }
            } catch (error: any) {
                const errorMessage = error?.response?.data?.detail ||
                                   error?.response?.data?.error ||
                                   error.message ||
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
