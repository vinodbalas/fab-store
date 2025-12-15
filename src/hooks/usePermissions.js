import { useMemo } from "react";
import { useAuth } from "../auth/AuthContext";

/**
 * Permission hook for role-based access control
 * 
 * Roles:
 * - admin: Full platform access
 * - developer: Can build and edit applications
 * - user: Can only use published applications
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const role = user?.role || "user";

  const permissions = useMemo(() => {
    const isAdmin = role === "admin";
    const isDeveloper = role === "developer";
    const isUser = role === "user";

    // Require authentication for builder-related features
    const requiresAuth = isAuthenticated;

    return {
      // Role checks
      isAdmin,
      isDeveloper,
      isUser,
      role,
      isAuthenticated,

      // AppBuilder permissions - requires authentication
      canBuildApps: requiresAuth && (isAdmin || isDeveloper),
      canEditApps: requiresAuth && (isAdmin || isDeveloper),
      canEditAnyApp: requiresAuth && isAdmin, // Only admin can edit others' apps
      canAccessAppBuilder: requiresAuth && (isAdmin || isDeveloper),

      // Publishing permissions - requires authentication
      canPublishApps: requiresAuth && isAdmin, // Direct publish (no approval)
      canSubmitApps: requiresAuth && (isAdmin || isDeveloper), // Submit for review
      canPublishModels: requiresAuth && isAdmin,
      canPublishPlatformComponents: requiresAuth && isAdmin,
      canPublishPlatforms: requiresAuth && isAdmin,

      // Platform management - requires authentication
      canManagePlatforms: requiresAuth && isAdmin,
      canManageUsers: requiresAuth && isAdmin,
      canViewAnalytics: requiresAuth && isAdmin,

      // My Space access - requires authentication
      canAccessMySpace: requiresAuth && (isAdmin || isDeveloper),

      // Store access
      canViewStore: true, // Everyone can view
      canLaunchApps: true, // Everyone can launch
      canCloneTemplates: requiresAuth && (isAdmin || isDeveloper),
      canAccessTemplates: requiresAuth && (isAdmin || isDeveloper),
      canAccessBuilderDetail: requiresAuth, // Requires authentication to view builder details
      canAccessPlatformsHub: true, // Everyone can view platform capabilities
      canAccessKnowledgeHub: true, // Everyone can view knowledge hub
    };
  }, [role, isAuthenticated]);

  return permissions;
}

