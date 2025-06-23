import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  logout, 
  handleLogout, 
  openSettings, 
  handleOpenSettings, 
  update, 
  updateUser, 
  setTheme 
} from '../../src/components/NavBar/helper';
import { getSession, updateSession } from '../../src/stores/sessionStore';
import { theme } from '../../src/stores/themeStore';

// Mock dependencies
vi.mock('../../src/stores/sessionStore', () => ({
  getSession: vi.fn(),
  updateSession: vi.fn(),
}));

vi.mock('../../src/stores/themeStore', () => ({
  theme: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock environment variable
Object.defineProperty(import.meta, 'env', {
  value: { PUBLIC_DEFAULT_SEASON: '5' },
  writable: true,
});

// Also set process.env for testing override
process.env.PUBLIC_DEFAULT_SEASON = '5';

describe('NavBar Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock DOM elements
    const mockElements = {
      'button-navbar-logout': { addEventListener: vi.fn() },
      'button-navbar-settings': { addEventListener: vi.fn() },
      'dialog-settings': { showModal: vi.fn() },
      'button-modal-signin': { style: { display: '' } },
      'button-modal-signup': { style: { display: '' } },
      'dropdown-navbar-profile': { style: { display: '' } },
      'navbar-username': { innerHTML: '' },
      'dropdown-navbar-avatar': { src: '' },
      'dropdown-navbar-profile-link': { href: '' },
      'button-navbar-theme': { checked: false, addEventListener: vi.fn() },
    };

    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      return mockElements[id as keyof typeof mockElements] as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logout', () => {
    it('calls updateSession with logged out state', () => {
      logout();

      expect(updateSession).toHaveBeenCalledWith({
        isLoggedIn: false,
        token: '',
        user: { id: '', username: '' }
      });
    });
  });

  describe('handleLogout', () => {
    it('adds click event listener to logout button', () => {
      const mockButton = { addEventListener: vi.fn() };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockButton as any);

      handleLogout();

      expect(document.getElementById).toHaveBeenCalledWith('button-navbar-logout');
      expect(mockButton.addEventListener).toHaveBeenCalledWith('click', logout);
    });
  });

  describe('openSettings', () => {
    it('calls showModal on settings dialog', () => {
      const mockDialog = { showModal: vi.fn() };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockDialog as any);

      openSettings();

      expect(document.getElementById).toHaveBeenCalledWith('dialog-settings');
      expect(mockDialog.showModal).toHaveBeenCalled();
    });
  });

  describe('handleOpenSettings', () => {
    it('adds click event listener to settings button', () => {
      const mockButton = { addEventListener: vi.fn() };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockButton as any);

      handleOpenSettings();

      expect(document.getElementById).toHaveBeenCalledWith('button-navbar-settings');
      expect(mockButton.addEventListener).toHaveBeenCalledWith('click', openSettings);
    });
  });

  describe('update', () => {
    it('shows auth buttons and hides profile when not logged in', () => {
      const mockSigninButton = { style: { display: '' } };
      const mockSignupButton = { style: { display: '' } };
      const mockProfileDropdown = { style: { display: '' } };

      vi.spyOn(document, 'getElementById')
        .mockReturnValueOnce(mockSigninButton as any)
        .mockReturnValueOnce(mockSignupButton as any)
        .mockReturnValueOnce(mockProfileDropdown as any);

      (getSession as any).mockReturnValue({ isLoggedIn: false });

      update();

      expect(mockSigninButton.style.display).toBe('block');
      expect(mockSignupButton.style.display).toBe('block');
      expect(mockProfileDropdown.style.display).toBe('none');
    });

    it('hides auth buttons and shows profile when logged in', () => {
      const mockSigninButton = { style: { display: '' } };
      const mockSignupButton = { style: { display: '' } };
      const mockProfileDropdown = { style: { display: '' } };

      vi.spyOn(document, 'getElementById')
        .mockReturnValueOnce(mockSigninButton as any)
        .mockReturnValueOnce(mockSignupButton as any)
        .mockReturnValueOnce(mockProfileDropdown as any);

      (getSession as any).mockReturnValue({ isLoggedIn: true });

      update();

      expect(mockSigninButton.style.display).toBe('none');
      expect(mockSignupButton.style.display).toBe('none');
      expect(mockProfileDropdown.style.display).toBe('block');
    });
  });

  describe('updateUser', () => {
    it('updates username and avatar when user is logged in', () => {
      const mockUsernameElement = { innerHTML: '' };
      const mockAvatarElement = { src: '' };
      const mockProfileLink = { href: '' };

      vi.spyOn(document, 'getElementById')
        .mockReturnValueOnce(mockUsernameElement as any)
        .mockReturnValueOnce(mockAvatarElement as any)
        .mockReturnValueOnce(mockProfileLink as any);

      const mockSession = {
        user: {
          id: '123',
          username: 'testuser'
        }
      };

      (getSession as any).mockReturnValue(mockSession);

      updateUser();

      expect(mockUsernameElement.innerHTML).toBe('testuser');
      expect(mockAvatarElement.src).toBe('https://ui-avatars.com/api/?name=testuser&background=random&size=128');
      expect(mockProfileLink.href).toBe('/duelists/123/Global?username=testuser&season=5');
    });

    it('handles empty username gracefully', () => {
      const mockUsernameElement = { innerHTML: '' };
      const mockAvatarElement = { src: '' };
      const mockProfileLink = { href: '' };

      vi.spyOn(document, 'getElementById')
        .mockReturnValueOnce(mockUsernameElement as any)
        .mockReturnValueOnce(mockAvatarElement as any)
        .mockReturnValueOnce(mockProfileLink as any);

      const mockSession = {
        user: {
          id: '',
          username: ''
        }
      };

      (getSession as any).mockReturnValue(mockSession);

      updateUser();

      expect(mockUsernameElement.innerHTML).toBe('');
      expect(mockAvatarElement.src).toBe('https://ui-avatars.com/api/?name=&background=random&size=128');
    });
  });

  describe('setTheme', () => {
    it('sets theme toggle to checked when theme is dracula', () => {
      const mockThemeButton = { checked: false, addEventListener: vi.fn() };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockThemeButton as any);
      (theme.get as any).mockReturnValue('dracula');

      setTheme();

      expect(mockThemeButton.checked).toBe(true);
      expect(mockThemeButton.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('sets theme toggle to unchecked when theme is not dracula', () => {
      const mockThemeButton = { checked: true, addEventListener: vi.fn() };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockThemeButton as any);
      (theme.get as any).mockReturnValue('night');

      setTheme();

      expect(mockThemeButton.checked).toBe(false);
      expect(mockThemeButton.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('toggles theme from night to dracula', () => {
      (theme.get as any).mockReturnValue('night');
      
      // Get the toggle function by calling setTheme and capturing the event listener
      const mockThemeButton = { checked: false, addEventListener: vi.fn() };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockThemeButton as any);
      
      setTheme();
      
      // Get the toggle function from the addEventListener call
      const toggleFunction = mockThemeButton.addEventListener.mock.calls[0][1];
      toggleFunction();

      expect(theme.set).toHaveBeenCalledWith('dracula');
    });

    it('toggles theme from dracula to night', () => {
      (theme.get as any).mockReturnValue('dracula');
      
      // Get the toggle function by calling setTheme and capturing the event listener
      const mockThemeButton = { checked: true, addEventListener: vi.fn() };
      vi.spyOn(document, 'getElementById').mockReturnValue(mockThemeButton as any);
      
      setTheme();
      
      // Get the toggle function from the addEventListener call
      const toggleFunction = mockThemeButton.addEventListener.mock.calls[0][1];
      toggleFunction();

      expect(theme.set).toHaveBeenCalledWith('night');
    });
  });
}); 