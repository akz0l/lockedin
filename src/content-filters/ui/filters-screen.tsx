import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { useBlocker, useBlockerStatus, useFocus } from '@/app-composition';
import { FILTERS, type FilterDefinition } from '@/content-filters/domain';
import { ProtectionRow } from '@/focus-session/ui/components/protection-row';
import { space } from '@/shared/theme';
import { ListGroup, ToggleRow } from '@/shared/ui';

export function FiltersScreen() {
  const router = useRouter();
  const blocker = useBlocker();
  const { status } = useBlockerStatus();
  const filters = useFocus((state) => state.filters);
  const setFilter = useFocus((state) => state.setFilter);
  const inApp = blocker.capabilities.inAppFilters;

  const group = (app: FilterDefinition['app']) => FILTERS.filter((filter) => filter.app === app);
  const isAvailable = (filter: FilterDefinition) => inApp || filter.app === 'Instagram';

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {inApp && status && !status.serviceEnabled ? (
        <ProtectionRow
          tone="warning"
          text="Blocking is off, so filters can’t work yet"
          action={{ label: 'Turn on', onPress: () => router.push('/permissions') }}
        />
      ) : null}

      <ListGroup
        header="Instagram"
        footer={
          inApp
            ? 'Applies inside the Instagram app.'
            : 'Applies inside Clean Instagram. Delete the Instagram app so this is the only way in.'
        }>
        {group('Instagram').map((filter) => (
          <ToggleRow
            key={filter.id}
            label={filter.feature}
            description={filter.description}
            value={filters[filter.id]}
            onValueChange={(enabled) => setFilter(filter.id, enabled)}
          />
        ))}
      </ListGroup>

      <ListGroup header="YouTube" footer={inApp ? 'Applies inside the YouTube app.' : 'Not available on iPhone yet.'}>
        {group('YouTube').map((filter) => (
          <ToggleRow
            key={filter.id}
            label={filter.feature}
            description={filter.description}
            value={isAvailable(filter) && filters[filter.id]}
            disabled={!isAvailable(filter)}
            onValueChange={(enabled) => setFilter(filter.id, enabled)}
          />
        ))}
      </ListGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: space.lg, gap: space.xl },
});
