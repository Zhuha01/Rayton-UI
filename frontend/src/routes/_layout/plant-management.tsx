/**
 * Plant administration route: paginated plant directory, add-plant flow, and plant card actions for operators.
 * Backed by plant query hooks and the same management layout primitives as other admin screens.
 */

import { Box, Container, Flex, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ManagementTwoColumnGrid } from '@/components_2/Pages/management/cards/ManagementTwoColumnGrid';
import { PlantManagementCard } from '@/components_2/Pages/management/Plant/PlantManagementCard';
import { ItemsPerPageSelect } from '@/components_2/ui/ItemsPerPageSelect';
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from '@/components_2/ui/Pagination';
import AddPlant from '@/components_2/Pages/management/Plant/AddPlant';
import useAuth from '@/hooks/useAuth';
import type { PlantsResponse } from '@/hooks/usePlantQueries';

// --- Search Schema & Constants (like admin.tsx) ---
const plantsSearchSchema = z.object({
  page: z.number().catch(1),
});

// --- Query Options Helper (like admin.tsx) ---
function getPlantsQueryOptions({
  page,
  pageSize,
  t,
}: {
  page: number;
  pageSize: number;
  t: TFunction<'management'>;
}) {
  const skip = (page - 1) * pageSize;
  const limit = pageSize;
  return {
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/plants/?skip=${skip}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(t('common.errors.failedToFetchPlants'));
      }
      return response.json() as Promise<PlantsResponse>;
    },
    queryKey: ['plants', 'all', { page, pageSize }],
  };
}

// --- Route Definition (like admin.tsx) ---
export const Route = createFileRoute('/_layout/plant-management')({
  //export const Route = createFileRoute("/_layout/tenant")({
  component: PlantsPage,
  validateSearch: (search) => plantsSearchSchema.parse(search),
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

// === PlantsTable Component (Defined internally, like UsersTable in admin.tsx) ===
function PlantsTable({
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
    data: plantsData,
    isLoading,
    isPlaceholderData,
    error,
  } = useQuery({
    ...getPlantsQueryOptions({ page, pageSize, t }),
    placeholderData: (prevData) => prevData,
    enabled: !isLoadingUser && !!currentUser?.is_superuser,
  });

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

  const plants = plantsData?.data ?? [];
  const count = plantsData?.count ?? 0;

  return (
    <>
      <ManagementTwoColumnGrid
        items={plants}
        getKey={(p) => String(p.ID)}
        listOpacity={isPlaceholderData ? 0.5 : 1}
        renderCard={(plant) => <PlantManagementCard plant={plant} />}
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
// === End PlantsTable Component ===

// === Main Page Component (like Admin component in admin.tsx) ===
function PlantsPage() {
  const { t } = useTranslation('management');
  const { page } = Route.useSearch();
  const { user: currentUser, isLoadingUser } = useAuth();
  const isSuperUser = !!currentUser?.is_superuser;
  const [pageSize, setPageSize] = useState(6);
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: plantsSummaryData } = useQuery({
    ...getPlantsQueryOptions({ page, pageSize, t }),
    placeholderData: (prevData) => prevData,
    enabled: !isLoadingUser && isSuperUser,
  });

  const totalPlants = plantsSummaryData?.count ?? 0;

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
            {t('plantManagement.title')}
          </Text>
          <Text fontSize="12px" fontWeight="normal" color="text.muted">
            {t('plantManagement.summary.totalPlants', { count: totalPlants })}
          </Text>
        </Flex>
        <Flex gap="16px" alignItems="center">
          <AddPlant />
        </Flex>
      </Flex>
      <PlantsTable
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
}
