// eslint-disable-next-line import/no-extraneous-dependencies
const {
  app,
  dialog,
  ipcMain,
  nativeTheme,
  protocol,
  session,
  shell,
  BrowserView,
} = require('electron');
const isDev = require('electron-is-dev');
const settings = require('electron-settings');

settings.configure({
  fileName: 'Settings', // backward compatible with electron-settings@3
});

const { getPreference, getPreferences } = require('./libs/preferences');

// Activate the Sentry Electron SDK as early as possible in every process.
if (!isDev && getPreference('sentry')) {
  // eslint-disable-next-line global-require
  require('./libs/sentry');
}

const loadListeners = require('./listeners');
const loadInvokers = require('./invokers');

const authWindow = require('./windows/auth');
const mainWindow = require('./windows/main');
const openUrlWithWindow = require('./windows/open-url-with');

const { createMenu } = require('./libs/create-menu');
const { addView, reloadViewsDarkReader } = require('./libs/views');
const fetchUpdater = require('./libs/fetch-updater');
const { getWorkspaces, setWorkspace } = require('./libs/workspaces');
const sendToAllWindows = require('./libs/send-to-all-windows');
const extractHostname = require('./libs/extract-hostname');
const { getAppLockStatusAsync } = require('./libs/app-lock');

const MAILTO_URLS = require('./constants/mailto-urls');

const appJson = require('./app.json');

const gotTheLock = app.requestSingleInstanceLock();

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  const win = mainWindow.get();
  if (win != null) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

if (!gotTheLock) {
  // eslint-disable-next-line
  app.quit();
} else {
  app.setName(appJson.name);

  const useHardwareAcceleration = getPreference('useHardwareAcceleration');
  if (!useHardwareAcceleration) {
    app.disableHardwareAcceleration();
  }

  const ignoreCertificateErrors = getPreference('ignoreCertificateErrors');
  if (ignoreCertificateErrors) {
    // https://www.electronjs.org/docs/api/command-line-switches
    app.commandLine.appendSwitch('ignore-certificate-errors');
  }

  // mock app.whenReady
  let trulyReady = false;
  ipcMain.once('truly-ready', () => { trulyReady = true; });
  const whenTrulyReady = () => {
    if (trulyReady) return Promise.resolve();
    return new Promise((resolve) => {
      ipcMain.once('truly-ready', () => {
        trulyReady = true;
        resolve();
      });
    });
  };

  loadListeners();
  loadInvokers();

  const commonInit = () => {
    app.whenReady()
      // if app lock is in Keychain, lock the app at first launch
      .then(() => getAppLockStatusAsync())
      .then((appLockStatus) => {
        if (appLockStatus.hasPassword) {
          global.locked = true;
        }
      })
      .then(() => mainWindow.createAsync())
      .then(() => {
        const {
          hibernateUnusedWorkspacesAtLaunch,
          proxyBypassRules,
          proxyPacScript,
          proxyRules,
          proxyType,
          themeSource,
        } = getPreferences();

        // configure proxy for default session
        if (proxyType === 'rules') {
          session.defaultSession.setProxy({
            proxyRules,
            proxyBypassRules,
          });
        } else if (proxyType === 'pacScript') {
          session.defaultSession.setProxy({
            proxyPacScript,
            proxyBypassRules,
          });
        }

        nativeTheme.themeSource = themeSource;

        createMenu();

        nativeTheme.addListener('updated', () => {
          sendToAllWindows('native-theme-updated');
          reloadViewsDarkReader();
        });

        const workspaceObjects = getWorkspaces();

        Object.keys(workspaceObjects).forEach((id) => {
          const workspace = workspaceObjects[id];
          if (
            (hibernateUnusedWorkspacesAtLaunch || workspace.hibernateWhenUnused)
            && !workspace.active
          ) {
            if (!workspace.hibernated) {
              setWorkspace(workspace.id, { hibernated: true });
            }
            return;
          }
          addView(mainWindow.get(), workspace);
        });

        ipcMain.emit('request-update-pause-notifications-info');
      })
      .then(() => {
        // Fix webview is not resized automatically
        // when window is maximized on Linux
        // https://github.com/webcatalog/webcatalog-app/issues/561

        // run it here not in mainWindow.createAsync()
        // because if the `mainWindow` is maximized or minimized
        // before the workspaces's BrowserView fully loaded
        // error will occur
        // see https://github.com/webcatalog/webcatalog-app/issues/637
        if (process.platform === 'linux') {
          const win = mainWindow.get();
          const handleMaximize = () => {
            // getContentSize is not updated immediately
            // try once after 0.2s (for fast computer), another one after 1s (to be sure)
            setTimeout(() => {
              ipcMain.emit('request-realign-active-workspace');
            }, 200);
            setTimeout(() => {
              ipcMain.emit('request-realign-active-workspace');
            }, 1000);
          };
          win.on('maximize', handleMaximize);
          win.on('unmaximize', handleMaximize);
        }
      })
      .then(() => {
        // trigger whenTrulyReady;
        ipcMain.emit('truly-ready');
      });
  };

  app.on('ready', () => {
    // https://github.com/electron/electron/issues/23757
    protocol.registerFileProtocol('file', (request, callback) => {
      const pathname = decodeURI(request.url.replace('file:///', ''));
      callback(pathname);
    });

    global.appJson = appJson;

    const {
      attachToMenubar,
      autoCheckForUpdates,
      customUserAgent,
      navigationBar,
      sidebar,
      titleBar,
    } = getPreferences();

    if (customUserAgent) {
      app.userAgentFallback = customUserAgent;
    } else {
      // Hide Electron from UA to improve compatibility
      // https://github.com/webcatalog/webcatalog-app/issues/182
      app.userAgentFallback = app.userAgentFallback
        // Fix WhatsApp requires Google Chrome 49+ bug
        // App Name doesn't have white space in user agent. 'Google Chat' app > GoogleChat/8.1.1
        .replace(` ${app.name.replace(/ /g, '')}/${app.getVersion()}`, '')
        // Hide Electron from UA to improve compatibility
        // https://github.com/webcatalog/webcatalog-app/issues/182
        .replace(` Electron/${process.versions.electron}`, '');
    }

    global.attachToMenubar = attachToMenubar;
    global.sidebar = sidebar;
    global.titleBar = titleBar;
    global.navigationBar = navigationBar;
    global.MAILTO_URLS = MAILTO_URLS;

    commonInit();

    whenTrulyReady()
      .then(() => {
        if (appJson.legacySinglebox) {
          setTimeout(() => {
            dialog.showMessageBox(mainWindow.get(), {
              type: 'info',
              message: 'We\'ve merged Singlebox into WebCatalog. Visit our website to learn more.',
              buttons: ['Learn more', 'OK'],
              cancelId: 1,
              defaultId: 0,
            })
              .then(({ response }) => {
                if (response === 0) {
                  shell.openExternal('https://webcatalog.app/singlebox?utm_source=singlebox&utm_campaign=singlebox_merged');
                }
              })
              .catch(console.log); // eslint-disable-line
          }, 2000);
        }

        if (autoCheckForUpdates) {
          // only notify user about update again after one week
          const lastShowNewUpdateDialog = getPreference('lastShowNewUpdateDialog');
          const updateInterval = 7 * 24 * 60 * 60 * 1000; // one week
          const now = Date.now();
          if (now - lastShowNewUpdateDialog > updateInterval) {
            fetchUpdater.checkForUpdates(true);
          }
        }
      });
  });

  app.on('before-quit', () => {
    const win = mainWindow.get();
    if (win) {
      // https://github.com/atom/electron/issues/444#issuecomment-76492576
      win.forceClose = true;
      win.setBrowserView(null);
    }

    // https://github.com/webcatalog/webcatalog-app/issues/1141
    // the bug seems to only occur when there's BrowserView opened
    // so destroy all BrowserViews before exiting
    const views = BrowserView.getAllViews();
    views.forEach((view) => {
      view.destroy();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    const win = mainWindow.get();
    if (win == null) {
      commonInit();
    } else {
      mainWindow.show();
    }
  });

  app.on('open-url', (e, url) => {
    e.preventDefault();

    whenTrulyReady()
      .then(() => {
        // focus on window
        mainWindow.show();

        const workspaces = Object.values(getWorkspaces());

        if (workspaces.length < 1) return null;

        // handle mailto:
        if (url.startsWith('mailto:')) {
          const mailtoWorkspaces = workspaces
            .filter((workspace) => extractHostname(
              workspace.homeUrl || appJson.url,
            ) in MAILTO_URLS);

          // pick automically if there's only one choice
          if (mailtoWorkspaces.length === 0) {
            ipcMain.emit(
              'request-show-message-box', null,
              'None of your workspaces supports composing email messages.',
              'error',
            );
            return null;
          }
          if (mailtoWorkspaces.length === 1) {
            const mailtoUrl = MAILTO_URLS[extractHostname(
              mailtoWorkspaces[0].homeUrl || appJson.url,
            )];
            const u = mailtoUrl.replace('%s', url);
            ipcMain.emit('request-load-url', null, u, mailtoWorkspaces[0].id);
            return null;
          }

          return openUrlWithWindow.show(url);
        }

        // handle https/http
        // pick automically if there's only one choice
        if (workspaces.length === 1) {
          ipcMain.emit('request-load-url', null, url, workspaces[0].id);
          return null;
        }

        return openUrlWithWindow.show(url);
      });
  });

  app.on('login', (e, webContents, request, authInfo, callback) => {
    e.preventDefault();
    const sessId = String(Date.now());
    authWindow.show(sessId, request.url);

    const listener = (ee, id, success, username, password) => {
      if (id !== sessId) return;

      if (success) {
        callback(username, password);
      } else {
        callback();
      }

      ipcMain.removeListener('continue-auth', listener);
    };

    ipcMain.on('continue-auth', listener);
  });
}
