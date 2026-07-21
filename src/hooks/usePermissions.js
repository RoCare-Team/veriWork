import { useQuery } from '@tanstack/react-query'
import { enterpriseKeys, fetchMyPermissions } from '../api/enterprise'

const LEVEL_RANK = { none: 0, view: 1, manage: 2 }

/**
 * The signed-in company user's role + module permissions.
 *
 * `can(module, level)` mirrors the backend guard: `manage` satisfies `view`.
 *
 * `ready` says whether we actually have a permission map. Until it's true,
 * callers must NOT treat `can() === false` as "denied" — it just means unknown.
 * Navigation should stay visible while unknown (the backend still guards every
 * route); only affordances that grant power should wait for `ready`.
 */
export function usePermissions() {
  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.myPermissions,
    queryFn: fetchMyPermissions,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const payload = data?.data || data || {}
  const permissions = payload.permissions || {}
  const ready = !isLoading && !error && Object.keys(permissions).length > 0

  const can = (module, level = 'view') => {
    const actual = permissions[module] || 'none'
    return (LEVEL_RANK[actual] || 0) >= (LEVEL_RANK[level] || 0)
  }

  return {
    isLoading,
    error,
    ready,
    companyRole: payload.companyRole || null,
    roleLabel: payload.roleLabel || '',
    permissions,
    assignableRoles: payload.assignableRoles || [],
    can,
  }
}

export default usePermissions
