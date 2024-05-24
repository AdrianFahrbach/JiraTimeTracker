import { Issue } from 'jira.js/out/version3/models';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  addWorklogAtom,
  currentOverlayAtom,
  currentWorklogToEditAtom,
  selectedDateAtom,
  themeAtom,
  worklogsAtom,
} from '../atoms';
import { CustomTextInput } from '../components/CustomTextInput';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SearchResultsEntry } from '../components/SearchResultsEntry';
import { Overlay } from '../const';
import { formatDateToYYYYMMDD } from '../services/date.service';
import { useTranslation } from '../services/i18n.service';
import { getIssuesBySearchQuery } from '../services/jira.service';
import { useModal } from '../services/modal.service';
import { useThemedStyles } from '../services/theme.service';
import { createNewLocalWorklog } from '../services/worklog.service';
import { Theme } from '../styles/theme/theme-types';
import { typo } from '../styles/typo';
import { IssueBase, Worklog } from '../types/global.types';
import { Tabs } from '../components/Tabs';

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const Search: FC = () => {
  const selectedDate = useAtomValue(selectedDateAtom);
  const addWorklog = useSetAtom(addWorklogAtom);
  const [currentOverlay, setCurrentOverlay] = useAtom(currentOverlayAtom);
  const setCurrentWorklogToEdit = useSetAtom(currentWorklogToEditAtom);
  const [searchValue, setSearchValue] = useState('');
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Issue[]>([]);
  const theme = useAtomValue(themeAtom);
  const styles = useThemedStyles(createStyles);
  const hasCharacters = searchValue.trim().length > 0;
  const enoughCharacters = searchValue.trim().length >= 3;
  const { t } = useTranslation();
  const worklogs = useAtomValue(worklogsAtom);
  const { getModalConfirmation } = useModal();

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        setSearchIsLoading(true);
        try {
          setSearchResults(await getIssuesBySearchQuery(query));
        } catch (e) {
          console.error('Error while searching', e);
        } finally {
          setSearchIsLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue || trimmedValue.length < 3) {
      setSearchResults([]);
      return;
    }
    debouncedSearch(trimmedValue);
  }, [searchValue]);

  /**
   * List of worklogs that have been worked on most recently.
   * This allows the user to quickly add a new worklog for an issue they have worked on recently without searching.
   */
  const latestWorklogsWorkedOn: Worklog[] = useMemo(() => {
    let maxWorklogsShown = 10;
    const latestWorklogs: Worklog[] = [];

    worklogs
      .sort((a, b) => {
        if (a.started === b.started) {
          return b.id.localeCompare(a.id);
        }
        return b.started.localeCompare(a.started);
      })
      .forEach(worklog => {
        const alreadyInList = latestWorklogs.some(w => w.issue.key === worklog.issue.key);
        if (alreadyInList || latestWorklogs.length > maxWorklogsShown) {
          return;
        }
        latestWorklogs.push(worklog);
      });

    return latestWorklogs;
  }, [worklogs]);

  async function handleOnWorklogStart(issueBase: IssueBase) {
    if (formatDateToYYYYMMDD(new Date()) !== selectedDate) {
      const confirmed = await getModalConfirmation({
        icon: 'timer-warning',
        headline: t('modals.startTimerInPastHeadline'),
        text: t('modals.startTimerInPastText'),
      });
      if (!confirmed) {
        return;
      }
    }
    const worklog = createNewLocalWorklog({
      issue: {
        id: issueBase.id,
        key: issueBase.key,
        summary: issueBase.summary,
      },
      started: selectedDate,
    });
    addWorklog(worklog);
    setCurrentWorklogToEdit(worklog);
    setCurrentOverlay([Overlay.SEARCH, Overlay.EDIT_WORKLOG]);
    setTimeout(() => setCurrentOverlay([Overlay.EDIT_WORKLOG]), 500);
  }

  const hasTabs = true;

  return (
    <Layout
      customBackgroundColor={theme.backgroundDrawer}
      header={{
        align: 'left',
        onBackPress: () => setCurrentOverlay(null),
        position: 'absolute',
        title: t('worklogs.addNewWorklog'),
      }}>
      <View style={[styles.inputContainer, !hasTabs && styles.inputContainerWithoutTabs]}>
        <CustomTextInput
          isVisible={!!currentOverlay && currentOverlay.includes(Overlay.SEARCH)}
          placeholder={t('search.placeholder')}
          value={searchValue}
          onChangeText={setSearchValue}
          iconLeft={
            <Image
              style={styles.icon}
              source={
                theme.type === 'light'
                  ? require('../assets/icons/search-light.png')
                  : require('../assets/icons/search-dark.png')
              }
            />
          }
        />
      </View>
      {hasTabs && <Tabs tabs={placeholderTabs} />}
      <ScrollView style={styles.entriesContainer} removeClippedSubviews={false}>
        {searchIsLoading && (
          <View style={styles.loadingSpinnerContainer}>
            <LoadingSpinner />
          </View>
        )}
        {hasCharacters && !enoughCharacters && !searchIsLoading && (
          <Text style={styles.errorMessage}>{t('search.error.minLength')}</Text>
        )}
        {enoughCharacters && !searchIsLoading && searchResults?.length === 0 && (
          <Text style={styles.errorMessage}>{t('search.error.noResults')}</Text>
        )}
        {!searchIsLoading &&
          searchResults?.map(issue => (
            <SearchResultsEntry
              key={`issue-${issue.id}`}
              issue={{
                id: issue.id,
                key: issue.key,
                project: {
                  name: issue.fields.project.name,
                },
                summary: issue.fields.summary,
              }}
              onPress={() => handleOnWorklogStart({ id: issue.id, key: issue.key, summary: issue.fields.summary })}
            />
          ))}
        {!hasCharacters &&
          latestWorklogsWorkedOn.map(worklog => (
            <SearchResultsEntry
              key={`worklog-${worklog.id}`}
              issue={{
                id: worklog.issue.id,
                key: worklog.issue.key,
                project: {
                  // TODO persist project name in worklog or persist id and get project name some other way
                  name: '',
                },
                summary: worklog.issue.summary,
              }}
              onPress={() =>
                handleOnWorklogStart({
                  id: worklog.issue.id,
                  key: worklog.issue.key,
                  summary: worklog.issue.summary,
                })
              }
            />
          ))}
      </ScrollView>
    </Layout>
  );
};

const placeholderTabs = [
  { label: 'Orcaya', imageSrc: require('../assets/logo-orcaya.png') },
  { label: 'The Mobility House', imageSrc: require('../assets/logo-tmh.png') },
  { label: 'Solid', imageSrc: require('../assets/logo-solid.png') },
  { label: 'Super langer Workspace-Name zum Testen', imageSrc: require('../assets/logo-orcaya.png') },
];

function createStyles(theme: Theme) {
  return StyleSheet.create({
    inputContainer: {
      width: '100%',
      height: 52,
      flexBasis: 52,
      paddingHorizontal: 16,
      paddingVertical: 8,
      ...Platform.select({
        default: {
          marginTop: 53,
        },
        windows: {
          marginTop: 44,
        },
      }),
    },
    inputContainerWithoutTabs: {
      borderColor: theme.border,
      borderBottomWidth: 1,
    },
    icon: {
      width: 16,
      height: 16,
    },
    entriesContainer: {
      flexGrow: 1,
      overflow: 'visible',
    },
    loadingSpinnerContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      marginTop: 98,
    },
    errorMessage: {
      ...typo.body,
      textAlign: 'center',
      opacity: 0.4,
      marginTop: 100,
    },
  });
}
