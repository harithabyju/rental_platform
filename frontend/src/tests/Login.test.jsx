import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ThemeProvider } from '../contexts/ThemeContext.jsx'; // Import ThemeProvider

describe('Login Page', () => {
  const renderLogin = () =>
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

  // Mock document.fonts for jsdom (needed for SplitText animations)
  beforeAll(() => {
    Object.defineProperty(document, 'fonts', {
      value: {
        status: 'loaded',
        ready: Promise.resolve(),
        load: vi.fn(),
        addEventListener: vi.fn(),
      },
      configurable: true,
    });
  });

  test('renders login form', () => {
    renderLogin();

    // Check email and password inputs
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Check button text
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows user to type into inputs', async () => {
    renderLogin();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'mypassword');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('mypassword');
  });
});
/*
 RERUN  src/tests/Login.test.jsx x4 

stderr | src/tests/Login.test.jsx > Login Page > renders login form      
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.comm/v6/upgrading/future#v7_relativesplatpath.

 ✓ src/tests/Login.test.jsx (2 tests) 1298ms
   ✓ Login Page (2)
     ✓ renders login form  743ms
     ✓ allows user to type into inputs  551ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  07:24:40
   Duration  1.72s

 PASS  Waiting for file changes...*/