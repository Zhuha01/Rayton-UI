/**
 * Tenant administration route: lists tenants with pagination, creation entry point, and delete mutations.
 * Superuser-only management surface built on shared grid/card components and TanStack Query hooks.
 */

import { Box, Container, Flex, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { ApiError, TenantsService } from '@/client';
import { ManagementTwoColumnGrid } from '@/components_2/Pages/management/cards/ManagementTwoColumnGrid';
import { TenantManagementCard } from '@/components_2/Pages/management/Tenant/TenantManagementCard';
import { ItemsPerPageSelect } from '@/components_2/ui/ItemsPerPageSelect';
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from '@/components_2/ui/Pagination';
import AddTenant from '@/components_2/Pages/management/Tenant/AddTenant';
import useAuth from '@/hooks/useAuth';
import { useDeleteTenant } from '@/hooks/useTenantQueries';

// --- Search Schema & Constants (like admin.tsx) ---
const tenantsSearchSchema = z.object({
  page: z.number().catch(1),
});

// --- Query Options Helper (like admin.tsx) ---
function getTenantsQueryOptions({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const queryParams = {
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };
  return {
    queryFn: () => TenantsService.readTenants(queryParams),
    queryKey: ['tenants', { page, pageSize }],
  };
}

// --- Route Definition (like admin.tsx) ---
export const Route = createFileRoute('/_layout/tenant')({
  component: TenantsPage,
  validateSearch: (search) => tenantsSearchSchema.parse(search),
  // beforeLoad: async () => {
  //     if (!isLoggedIn()) {
  //         throw redirect({ to: "/login" });
  //     }
  //     const user = queryClient.getQueryData<UserPublic>(["currentUser"]);
  //     if (!user?.is_superuser) {
  //         throw redirect({ to: "/" });
  //     }
  // },
});

// === TenantsTable Component (Defined internally, like UsersTable in admin.tsx) ===
function TenantsTable({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number;
  onPageSizeChange: (nextPageSize: number) => void;
}) {
  const { t } = useTranslation('management');
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch(); // Use search from the route
  const { user: currentUser, isLoadingUser } = useAuth();

  const {
    data: tenantsData,
    isLoading,
    isPlaceholderData,
    error,
  } = useQuery({
    ...getTenantsQueryOptions({ page, pageSize }),
    placeholderData: (prevData) => prevData,
    enabled: !isLoadingUser && !!currentUser?.is_superuser,
  });

  // Get mutation for displaying top-level errors if a delete fails
  const deleteTenantMutation = useDeleteTenant();

  const setPage = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
      replace: true,
    });
  };

  if (isLoadingUser || isLoading) {
    return (
      <Container py={8} centerContent>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Container>
    );
  }
  if (error) {
    return (
      <Container py={8}>
        <Text color="red.500">
          {t('common.errors.genericWithMessage', { message: error.message })}
        </Text>
      </Container>
    );
  }
  if (!currentUser?.is_superuser) {
    return (
      <Container py={8}>
        <Text color="red.500">{t('common.errors.accessDenied')}</Text>
      </Container>
    );
  }

  const tenants = tenantsData?.data ?? [];
  const count = tenantsData?.count ?? 0;

  return (
    <>
      {deleteTenantMutation.isError && (
        <Text color="red.500" mb={4}>
          {t('common.errors.errorPrefix')}{' '}
          {deleteTenantMutation.error instanceof ApiError &&
          typeof deleteTenantMutation.error.body === 'object' &&
          deleteTenantMutation.error.body !== null &&
          'detail' in deleteTenantMutation.error.body
            ? String(deleteTenantMutation.error.body.detail)
            : deleteTenantMutation.error?.message}
        </Text>
      )}
      <ManagementTwoColumnGrid
        items={tenants}
        getKey={(t) => t.id}
        listOpacity={isPlaceholderData ? 0.5 : 1}
        renderCard={(tenant) => <TenantManagementCard tenant={tenant} />}
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
            {' '}
            <PaginationPrevTrigger /> <PaginationItems />{' '}
            <PaginationNextTrigger />{' '}
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}
// === End TenantsTable Component ===

// === Main Page Component (like Admin component in admin.tsx) ===
function TenantsPage() {
  const { t } = useTranslation('management');
  const { page } = Route.useSearch();
  const { user: currentUser, isLoadingUser } = useAuth();
  const isSuperUser = !!currentUser?.is_superuser;
  const [pageSize, setPageSize] = useState(6);
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: tenantsSummaryData } = useQuery({
    ...getTenantsQueryOptions({ page, pageSize }),
    placeholderData: (prevData) => prevData,
    enabled: !isLoadingUser && isSuperUser,
  });

  const totalTenants = tenantsSummaryData?.count ?? 0;

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
            {t('tenant.title')}
          </Text>
          <Text fontSize="12px" fontWeight="normal" color="text.muted">
            {t('tenant.summary.totalTenants', { count: totalTenants })}
          </Text>
        </Flex>
        <Flex gap="16px" alignItems="center">
          <AddTenant />
        </Flex>
      </Flex>
      <TenantsTable
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
}
