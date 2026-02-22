import { useAuth } from "@/contexts/AuthContext";

export const useRole = () => {
  const { user } = useAuth();

  return {
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin',
    isFacilitator: user?.role === 'facilitator',
    isCorporate: user?.userType === 'corporate',
    isPartner: user?.userType === 'partner',
    hasAdminAccess: user?.role === 'admin',
    hasFacilitatorAccess: user?.role === 'facilitator' || user?.role === 'admin',
    hasStudentAccess: user?.role === 'student' || user?.role === 'admin',
  };
};
