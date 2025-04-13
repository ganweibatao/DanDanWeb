import { useState, useEffect } from 'react';
import { apiClient } from '../services/api'; // Assuming your apiClient is here

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
    student_profile?: { id: number; /* other student fields */ }; // If role is indicated by profile existence
    teacher_profile?: { id: number; /* other teacher fields */ };
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
        isLoading: true, // Start loading initially
        error: null,
    });

    useEffect(() => {
        const checkAuthStatus = async () => {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            // --- How do you know if the user is logged in? ---
            // Option 1: Check for a token in localStorage/sessionStorage
            const token = localStorage.getItem('token'); // Or wherever you store it
            if (!token) {
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    userRole: null,
                    isLoading: false,
                    error: null,
                });
                return; // Not logged in
            }

            // Option 2: Always try to fetch user data, backend handles auth via token
            try {
                // --- Fetch User Data ---
                const response = await apiClient.get<UserData>('accounts/users/current/');

                if (response.data) {
                    const userData = response.data;
                    let determinedRole: UserRole = null; // Default to null or unknown

                    // console.log("[useAuth] Received userData:", JSON.stringify(userData)); // Log raw data

                    // --- Determine Role Logic (Adapt based on your UserData structure) ---
                    // Priority 1: Check the user_type field sent by the backend
                    if (userData.user_type && ['student', 'teacher', 'admin'].includes(userData.user_type)) {
                        determinedRole = userData.user_type as UserRole;
                    }
                    // Fallback logic (if user_type is missing or unexpected)
                    // Example 1: Based on a 'role' field
                    else if (userData.role) { // Kept for potential backward compatibility
                        console.log("[useAuth] Role determined by role field (fallback).");
                        determinedRole = userData.role;
                    }
                    // Example 3: Based on profile existence (less reliable than user_type)
                    else if (userData.teacher_profile) { // Backend might still send profile object/ID
                        console.log("[useAuth] Role determined by teacher_profile existence (fallback).");
                        determinedRole = 'teacher';
                    } else if (userData.student_profile) {
                        console.log("[useAuth] Role determined by student_profile existence (fallback).");
                        determinedRole = 'student';
                    }
                    // Fallback for admin based on is_staff if user_type wasn't 'admin'
                    else if (userData.is_staff) {
                        determinedRole = 'admin';
                    }
                    // If role still cannot be determined
                    else {
                        console.log("[useAuth] Role could not be determined, setting to unknown.");
                        determinedRole = 'unknown'; // Set a specific unknown state
                        console.warn("Could not determine user role from API response:", userData);
                    }

                    console.log("[useAuth] Final determinedRole before setting state:", determinedRole);

                    setAuthState({
                        isAuthenticated: true,
                        user: userData,
                        userRole: determinedRole,
                        isLoading: false,
                        error: null,
                    });
                } else {
                     // Although API succeeded, data might be missing?
                    throw new Error("User data not found in response.");
                }

            } catch (error: any) {
                console.error("Authentication check failed:", error);
                // Handle specific errors (e.g., 401 Unauthorized means token is invalid)
                if (error.response?.status === 401) {
                     localStorage.removeItem('authToken'); // Clear invalid token
                 }
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    userRole: null,
                    isLoading: false,
                    error: error.response?.data?.detail || error.message || "Failed to verify authentication.",
                });
            }
        };

        checkAuthStatus();
        // Optionally, add logic here to listen for logout events or token changes
        // to update the auth state automatically.

    }, []); // Run only once on component mount

    return authState;
};
