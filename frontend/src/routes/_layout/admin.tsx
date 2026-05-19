/**
 * Superuser user-management route: paginated user list, CRUD entry points, and tenant-scoped reads via `UsersService`.
 * Search params are validated with Zod; layout follows the shared management card grid pattern.
 */

import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { UsersService } from '@/client';
import AddUser from '@/components_2/Pages/management/User/AddUser';
import { ManagementTwoColumnGrid } from '@/components_2/Pages/management/cards/ManagementTwoColumnGrid';
import { UserManagementCard } from '@/components_2/Pages/management/User/UserManagementCard';
import { ItemsPerPageSelect } from '@/components_2/ui/ItemsPerPageSelect';
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from '@/components_2/ui/Pagination';
import useAuth from '@/hooks/useAuth';
import { useTenants } from '@/hooks/useTenantQueries';

const usersSearchSchema = z.object({
  page: z.number().catch(1),
  filterTenantId: z.string().optional(),
  // filterAllTenants: z.enum(['true', 'false']).catch('true').transform(v => v === 'true'), // REMOVE
});

// Assuming the file path is back to _layout/admin.tsx
export const Route = createFileRoute('/_layout/admin')({
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
});

function UsersTable({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number;
  onPageSizeChange: (nextPageSize: number) => void;
}) {
  const { t } = useTranslation('management');
  const { user: currentUser, isLoadingUser } = useAuth();
  // const queryClient = useQueryClient(); // Can remove if not needed elsewhere
  // const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]); // REMOVE
  const navigate = useNavigate({ from: Route.fullPath });
  const { page, filterTenantId } = Route.useSearch();
  const { data: tenantsData } = useTenants();

  const isSuperUser = !!currentUser?.is_superuser;
  const shouldFetchAll = isSuperUser && !filterTenantId;
  const targetTenantId = shouldFetchAll ? null : filterTenantId;

  const { data, isLoading, isPlaceholderData, error } = useQuery({
    // queryKey includes all calculated params
    queryKey: [
      'users',
      {
        page,
        pageSize,
        tenantId: targetTenantId ?? 'all',
        allTenants: shouldFetchAll,
      },
    ],
    queryFn: () => {
      const currentQueryParams = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        tenantId: targetTenantId || undefined, // Use tenantId (camelCase)
        allTenants: shouldFetchAll || undefined, // Use allTenants (camelCase)
      };

      return UsersService.readUsers(currentQueryParams);
    },
    placeholderData: (prevData) => prevData,
    enabled: !isLoadingUser && isSuperUser,
  });

  const setPage = (newPage: number) => {
    // Renamed parameter for clarity
    navigate({
      // Ensure navigation uses the correct path '/admin'
      search: (prev) => ({ ...prev, page: newPage }),
      replace: true, // Use replace for pagination
    });
  };

  // Keep handleFilterChange if you still have the filter dropdown UI (not shown in provided code)
  // const handleFilterChange = (tenantId: string | null, allTenants: boolean) => { ... }

  const users = data?.data.slice(0, pageSize) ?? [];
  const count = data?.count ?? 0;

  if (isLoadingUser || isLoading) {
    return (
      <Flex justify="center" align="center" py={10}>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    );
  }

  // --- ADDED: Basic error display ---
  if (error) {
    return (
      <Text color="red.500">
        {t('admin.errors.loadUsersWithMessage', { message: error.message })}
      </Text>
    );
  } // --- END ADDED ---

  return (
    <>
      <ManagementTwoColumnGrid
        items={users}
        getKey={(u) => u.id}
        listOpacity={isPlaceholderData ? 0.5 : 1}
        renderCard={(user) => (
          <UserManagementCard
            user={user}
            tenantLabel={
              tenantsData?.data.find((t) => t.id === user.tenant_id)?.name ??
              `${user.tenant_id.substring(0, 8)}...`
            }
            actionsDisabled={currentUser?.id === user.id}
          />
        )}
      />
      <Flex justifyContent="space-between" alignItems="center" mt={6} mb={6}>
        <ItemsPerPageSelect value={pageSize} onChange={onPageSizeChange} />

        <PaginationRoot
          count={count}
          pageSize={pageSize}
          page={page}
          onPageChange={({ page: newPage }) => setPage(newPage)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function Admin() {
  const { t } = useTranslation('management');
  const { user: currentUser, isLoadingUser } = useAuth();
  const { page, filterTenantId } = Route.useSearch();
  const [pageSize, setPageSize] = useState(6);
  const navigate = useNavigate({ from: Route.fullPath });

  const isSuperUser = !!currentUser?.is_superuser;
  const shouldFetchAll = isSuperUser && !filterTenantId;
  const targetTenantId = shouldFetchAll ? null : filterTenantId;

  const { data: usersQueryData } = useQuery({
    queryKey: [
      'users',
      {
        page,
        pageSize,
        tenantId: targetTenantId ?? 'all',
        allTenants: shouldFetchAll,
      },
    ],
    queryFn: () => {
      const currentQueryParams = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        tenantId: targetTenantId || undefined,
        allTenants: shouldFetchAll || undefined,
      };
      return UsersService.readUsers(currentQueryParams);
    },
    placeholderData: (prevData) => prevData,
    enabled: !isLoadingUser && isSuperUser,
  });

  const totalUsers = usersQueryData?.count ?? 0;

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    navigate({
      search: (prev) => ({ ...prev, page: 1 }),
      replace: true,
    });
  };

  return (
    <Box maxW="full" p="24px">
      <Flex
        justify="space-between"
        alignItems="center"
        mb="24px"
        pb="16px"
        borderBottomWidth="2px"
        borderBottomStyle="solid"
        borderBottomColor="ui.PageHeader.divider"
        borderRadius="0"
      >
        <Flex direction="column" gap="4px">
          <Text
            fontSize="18px"
            fontWeight="bold"
            color="ui.PageHeader.title"
          >
            {t('admin.title')}
          </Text>
          <Text fontSize="12px" fontWeight="normal" color="text.muted">
            {t('admin.summary.totalUsers', { count: totalUsers })}
          </Text>
        </Flex>
        <Flex gap="16px" alignItems="center">
          <AddUser />
        </Flex>
      </Flex>
      <UsersTable pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
    </Box>
  );
}
