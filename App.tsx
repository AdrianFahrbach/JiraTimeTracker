import { Provider } from 'jotai';
import React, { FC, Suspense } from 'react';
import { Platform, Text } from 'react-native';
import { store } from './src/atoms';
import { ColorSchemeWatcher } from './src/watchers/ColorSchemeWatcher';
import { DebugTools } from './src/components/DebugTools';
import { NotificationWatcher } from './src/watchers/NotificationWatcher';
import { TrafficLights } from './src/components/TrafficLights';
import { WorklogStateWatcher } from './src/watchers/WorklogStateWatcher';
import { GlobalProvider } from './src/providers/GlobalProvider';
import { Main } from './src/screens/Main';
import { WorklogDeepLinkWatcher } from './src/watchers/WorklogDeepLinkWatcher';
import { WorklogBackupsWatcher } from './src/watchers/WorklogBackupsWatcher';
import { ModalConfirmation } from './src/components/modals/ModalConfirmation';
import { ModalAccountSelection } from './src/components/modals/ModalAccountSelection';

const App: FC = () => {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <Provider store={store}>
        {Platform.OS === 'macos' && <TrafficLights />}
        <ModalConfirmation />
        <ModalAccountSelection />
        <WorklogStateWatcher />
        <WorklogDeepLinkWatcher />
        <WorklogBackupsWatcher />
        <NotificationWatcher />
        <ColorSchemeWatcher />
        <GlobalProvider>
          <Main />
          {__DEV__ && <DebugTools />}
        </GlobalProvider>
      </Provider>
    </Suspense>
  );
};

export default App;
