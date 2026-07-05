import { render, screen } from '@testing-library/react';
import App from './App';
import { AppContextProvider } from './components/appContext';

// App requires AppContextProvider as an ancestor (it's mounted in index.js,
// not inside App.js itself) - useContext(AppContext) throws without it.
test('renders the empty-state storefront and the Edit Mode toggle by default', () => {
  render(
    <AppContextProvider>
      <App />
    </AppContextProvider>
  );
  expect(screen.getByText(/nothing to display/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^edit mode$/i })).toBeInTheDocument();
});
