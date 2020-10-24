/* eslint-disable no-constant-condition */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

import MenuIcon from '@material-ui/icons/Menu';

import { requestShowAppMenu } from '../../senders';

import connectComponent from '../../helpers/connect-component';

const TOOLBAR_HEIGHT = 28;
const BUTTON_WIDTH = 46;

const styles = (theme) => ({
  appBar: {
    // leave space for resizing cursor
    // https://github.com/electron/electron/issues/3022
    padding: 2,
    background: theme.palette.type === 'dark' ? undefined : theme.palette.grey[300],
  },
  toolbar: {
    minHeight: 28,
    paddingLeft: 0,
    paddingRight: 0,
    display: 'flex',
    WebkitAppRegion: 'drag',
    userSelect: 'none',
  },
  left: {
    // leave space for traffic light buttons
    paddingLeft: window.process.platform === 'darwin' && window.mode !== 'menubar' ? 64 : 0,
    boxSizing: 'border-box',
  },
  center: {
    flex: 1,
    fontSize: '0.8rem',
    height: TOOLBAR_HEIGHT,
    lineHeight: `${TOOLBAR_HEIGHT}px`,
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  right: {
    textAlign: 'right',
    boxSizing: 'border-box',
  },
  noDrag: {
    WebkitAppRegion: 'no-drag',
  },
  // https://github.com/AlexTorresSk/custom-electron-titlebar/blob/master/src/themebar.ts#L404
  windowsControl: {
    verticalAlign: 'middle',
    display: 'inline-block',
    height: TOOLBAR_HEIGHT,
    marginLeft: theme.spacing(2),
  },
  windowsIconBg: {
    display: 'inline-block',
    WebkitAppRegion: 'no-drag',
    height: '100%',
    width: BUTTON_WIDTH,
    background: 'none',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.common.black : theme.palette.grey[400],
    },
    '&:focus': {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.common.black : theme.palette.grey[400],
    },
  },
  windowsIcon: {
    height: '100%',
    width: '100%',
    maskSize: '23.1%',
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
    cursor: 'pointer',
  },
  windowsIconClose: {
    mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%",
  },
  windowsIconUnmaximize: {
    mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%",
  },
  windowsIconMaximize: {
    mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%",
  },
  windowsIconMinimize: {
    mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E\") no-repeat 50% 50%",
  },
  iconButton: {
    width: BUTTON_WIDTH,
    borderRadius: 0,
    height: TOOLBAR_HEIGHT,
  },
});

const EnhancedAppBar = ({
  title,
  classes,
  isMaximized,
}) => {
  const onDoubleClick = (e) => {
    // feature: double click on title bar to expand #656
    // https://github.com/webcatalog/webcatalog-app/issues/656
    // https://stackoverflow.com/questions/10554446/no-onclick-when-child-is-clicked
    if (e.target === e.currentTarget) {
      const win = window.require('electron').remote.getCurrentWindow();
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  };

  return (
    <AppBar
      position="static"
      className={classes.appBar}
      color="default"
      elevation={0}
    >
      <Toolbar
        variant="dense"
        className={classes.toolbar}
      >
        <div className={classes.left} onDoubleClick={onDoubleClick}>
          {(window.mode !== 'main' && window.mode !== 'menubar') ? null : (
            <IconButton
              size="small"
              color="inherit"
              aria-label="Menu"
              className={classnames(classes.iconButton, classes.noDrag)}
              onClick={(e) => {
                e.stopPropagation();
                requestShowAppMenu(e.x, e.y);
              }}
              disableRipple
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          )}
        </div>
        <div className={classes.center} onDoubleClick={onDoubleClick}>
          {title}
        </div>
        <div className={classes.right} onDoubleClick={onDoubleClick}>
          {window.process.platform !== 'darwin' && (
            <div className={classes.windowsControl}>
              <button
                className={classes.windowsIconBg}
                type="button"
                aria-label="Minimize"
                onClick={(e) => {
                  e.stopPropagation();
                  const browserWindow = window.remote.getCurrentWindow();
                  browserWindow.minimize();
                }}
              >
                <div className={classnames(classes.windowsIcon, classes.windowsIconMinimize)} />
              </button>
              {window.mode === 'main' && (
                <button
                  className={classes.windowsIconBg}
                  type="button"
                  aria-label={isMaximized ? 'Unmaximize' : 'Maximize'}
                  onClick={(e) => {
                    e.stopPropagation();
                    const browserWindow = window.remote.getCurrentWindow();
                    if (browserWindow.isMaximized()) {
                      browserWindow.unmaximize();
                    } else {
                      browserWindow.maximize();
                    }
                  }}
                >
                  <div
                    className={classnames(
                      classes.windowsIcon,
                      isMaximized && classes.windowsIconUnmaximize,
                      !isMaximized && classes.windowsIconMaximize,
                    )}
                  />
                </button>
              )}
              {window.mode !== 'menubar' && (
                <button
                  className={classes.windowsIconBg}
                  type="button"
                  aria-label={isMaximized ? 'Unmaximize' : 'Maximize'}
                  onClick={(e) => {
                    e.stopPropagation();
                    const browserWindow = window.remote.getCurrentWindow();
                    browserWindow.close();
                  }}
                >
                  <div
                    className={classnames(classes.windowsIcon, classes.windowsIconClose)}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

EnhancedAppBar.defaultProps = {
  title: '',
};

EnhancedAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  isMaximized: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
  isMaximized: state.general.isMaximized,
  title: ownProps.title || ((window.mode === 'main' || window.mode === 'menubar') && state.general.title ? state.general.title : window.remote.getGlobal('appJson').name),
});

export default connectComponent(
  EnhancedAppBar,
  mapStateToProps,
  null,
  styles,
);