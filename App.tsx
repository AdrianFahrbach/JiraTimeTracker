import { Provider } from 'jotai';
import React, { FC, Suspense } from 'react';
import { Button, Text, View } from 'react-native';
import { store } from './src/atoms';
import { ColorSchemeWatcher } from './src/components/ColorSchemeWatcher';
import { DebugTools } from './src/components/DebugTools';
import { WorklogStateWatcher } from './src/components/WorklogStateWatcher';
import { GlobalProvider } from './src/providers/GlobalProvider';
import { Main } from './src/screens/Main';
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui-react-native/menu';

const App: FC = () => {
  return (
    <View style={{ marginTop: 100 }}>
      <Menu>
        <MenuTrigger>
          <Button title='Open Menu' />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Option 1</MenuItem>
            <MenuItem>Option 2</MenuItem>
            <MenuItem>Option 3</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </View>
  );
};

export default App;
