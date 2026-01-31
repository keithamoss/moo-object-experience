import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { store } from './store/store';
import { theme } from './theme/theme';

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <div>
            <h1>Welcome to the Westralian People's Museum Object Experience</h1>
            <p>Search and discovery interface for objects in the Westralian People's Museum of Objects of Interest and Reference Library</p>
          </div>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
);
