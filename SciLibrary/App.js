// import 'react-native-gesture-handler';

import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import store from './src/store/store';


export default function App() {
    return (
        <Provider store={store}>
            <AppNavigator />
        </Provider>
    );
}


