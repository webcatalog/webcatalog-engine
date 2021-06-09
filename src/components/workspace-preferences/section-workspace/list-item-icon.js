/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Color from 'color';

import * as materialColors from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Badge from '@material-ui/core/Badge';
import ListItem from '@material-ui/core/ListItem';

import CheckIcon from '@material-ui/icons/Check';

import connectComponent from '../../../helpers/connect-component';
import getAvatarText from '../../../helpers/get-avatar-text';

import {
  updateForm,
} from '../../../state/dialog-workspace-preferences/actions';

import {
  getIconFromInternet,
  getIconFromAppSearch,
} from '../../../state/dialog-edit-workspace/actions';

import defaultWorkspaceImageLight from '../../../images/default-workspace-image-light.png';
import defaultWorkspaceImageDark from '../../../images/default-workspace-image-dark.png';

const styles = (theme) => ({
  flexGrow: {
    flex: 1,
  },
  button: {
    float: 'right',
  },
  avatarFlex: {
    display: 'flex',
    flexDirection: 'column',
  },
  avatarLeft: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: 0,
    paddingRight: theme.spacing(4),
    display: 'flex',
    flexDirection: 'row',
  },
  avatarRight: {
    flex: 1,
    paddingTop: theme.spacing(2),
    paddingRight: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing(2),
  },
  avatar: {
    fontFamily: theme.typography.fontFamily,
    height: 36,
    width: 36,
    background: theme.palette.common.white,
    borderRadius: 4,
    color: theme.palette.getContrastText(theme.palette.common.white),
    fontSize: '24px',
    lineHeight: '36px',
    textAlign: 'center',
    fontWeight: 400,
    textTransform: 'uppercase',
    userSelect: 'none',
    boxShadow: theme.palette.type === 'dark' ? 'none' : '0 0 1px 1px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  avatarSelected: {
    boxShadow: `0 0 4px 4px ${theme.palette.primary.main}`,
  },
  avatarSelectedBadgeContent: {
    background: theme.palette.primary.main,
    borderRadius: 12,
    width: 24,
    height: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    color: theme.palette.common.white,
  },
  textAvatar: {
    background: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    color: theme.palette.getContrastText(theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black),
  },
  transparentAvatar: {
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    color: theme.palette.text.primary,
  },
  avatarPicture: {
    height: 36,
    width: 36,
  },
  buttonBot: {
    marginTop: theme.spacing(1),
  },
  caption: {
    display: 'block',
  },
  colorPickerRow: {
    paddingBottom: theme.spacing(1),
  },
  colorPicker: {
    height: 24,
    width: 24,
    borderRadius: 12,
    marginRight: theme.spacing(1),
    cursor: 'pointer',
    outline: 'none',
    display: 'inline-block',
  },
  colorPickerSelected: {
    boxShadow: `0 0 2px 2px ${theme.palette.primary.main}`,
  },
});

const ListItemIcon = ({
  accountInfo,
  backgroundColor,
  classes,
  downloadingIcon,
  id,
  internetIcon,
  name,
  onGetIconFromInternet,
  onGetIconFromAppSearch,
  onUpdateForm,
  order,
  picturePath,
  preferredIconType,
  shouldUseDarkColors,
  transparentBackground,
}) => {
  let selectedIconType = 'text';
  if (((picturePath || internetIcon) && preferredIconType === 'auto') || (preferredIconType === 'image')) {
    selectedIconType = 'image';
  } else if (accountInfo && accountInfo.picturePath && (preferredIconType === 'auto' || preferredIconType === 'accountInfo')) {
    selectedIconType = 'accountInfo';
  }

  const finalName = (() => {
    if (accountInfo) {
      if (accountInfo.name && accountInfo.email) {
        return `${accountInfo.name} (${accountInfo.email})`;
      }
      if (accountInfo.name) {
        return accountInfo.name;
      }
    }
    return name;
  })();

  const renderAvatar = (avatarContent, type, title = null, avatarAdditionalClassnames = []) => (
    <div className={classes.avatarContainer} title={title}>
      {selectedIconType === type ? (
        <Badge
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          badgeContent={(
            <div className={classes.avatarSelectedBadgeContent}>
              <CheckIcon fontSize="inherit" />
            </div>
          )}
        >
          <div
            className={classnames(
              classes.avatar,
              transparentBackground && classes.transparentAvatar,
              classes.avatarSelected,
              ...avatarAdditionalClassnames,
            )}
            style={(() => {
              if (type === 'text' && backgroundColor && !transparentBackground) {
                return {
                  backgroundColor,
                  color: Color(backgroundColor).isDark() ? '#fff' : '#000',
                };
              }
              return null;
            })()}
          >
            {avatarContent}
          </div>
        </Badge>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className={classnames(
            classes.avatar,
            transparentBackground && classes.transparentAvatar,
            ...avatarAdditionalClassnames,
          )}
          onClick={() => onUpdateForm({ preferredIconType: type })}
          onKeyDown={() => onUpdateForm({ preferredIconType: type })}
        >
          {avatarContent}
        </div>
      )}
    </div>
  );

  return (
    <ListItem>
      <div className={classes.flexGrow}>
        <div className={classes.avatarFlex}>
          <div className={classes.avatarLeft}>
            {renderAvatar(
              getAvatarText(id, finalName, order),
              'text',
              'Text',
              [classes.textAvatar],
            )}
            {renderAvatar(
              <img
                alt="Icon"
                className={classes.avatarPicture}
                src={(() => {
                  if (picturePath) return `file://${picturePath}`;
                  if (internetIcon) return internetIcon;
                  return shouldUseDarkColors
                    ? defaultWorkspaceImageLight : defaultWorkspaceImageDark;
                })()}
              />,
              'image',
              'Image',
            )}
            {(accountInfo && accountInfo.picturePath) && renderAvatar(
              <img alt="Icon" className={classes.avatarPicture} src={`file://${accountInfo.picturePath}`} />,
              'accountInfo',
              'Account\'s Picture',
            )}
          </div>
          <div className={classes.avatarRight}>
            {selectedIconType === 'text' && (
              <>
                <div className={classes.colorPickerRow}>
                  <div
                    className={classnames(
                      classes.colorPicker,
                      backgroundColor == null && classes.colorPickerSelected,
                    )}
                    title="default"
                    style={{ backgroundColor: shouldUseDarkColors ? '#fff' : '#000' }}
                    aria-label="default"
                    role="button"
                    tabIndex={0}
                    onClick={() => onUpdateForm({
                      backgroundColor: null,
                    })}
                    onKeyDown={() => onUpdateForm({
                      backgroundColor: null,
                    })}
                  />
                  {backgroundColor != null && (
                    <div
                      className={classnames(
                        classes.colorPicker,
                        classes.colorPickerSelected,
                      )}
                      title="default"
                      style={{ backgroundColor }}
                      aria-label="default"
                      role="button"
                      tabIndex={0}
                      onClick={() => onUpdateForm({
                        backgroundColor,
                      })}
                      onKeyDown={() => onUpdateForm({
                        backgroundColor,
                      })}
                    />
                  )}
                </div>
                <div className={classes.colorPickerRow}>
                  {Object.keys(materialColors).map((colorId) => {
                    const colorScales = materialColors[colorId];
                    if (!colorScales[500]) return null;
                    return (
                      <div
                        key={colorId}
                        title={colorId}
                        className={classnames(
                          classes.colorPicker,
                          backgroundColor === colorScales[500] && classes.colorPickerSelected,
                        )}
                        style={{ backgroundColor: materialColors[colorId][500] }}
                        aria-label={colorId}
                        role="button"
                        tabIndex={0}
                        onClick={() => onUpdateForm({
                          backgroundColor: materialColors[colorId][500],
                        })}
                        onKeyDown={() => onUpdateForm({
                          backgroundColor: materialColors[colorId][500],
                        })}
                      />
                    );
                  })}
                </div>
              </>
            )}
            {selectedIconType === 'image' && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={downloadingIcon}
                  onClick={() => {
                    const opts = {
                      properties: ['openFile'],
                      filters: [
                        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'tif', 'bmp', 'dib'] },
                      ],
                    };
                    window.remote.dialog.showOpenDialog(window.remote.getCurrentWindow(), opts)
                      .then(({ canceled, filePaths }) => {
                        if (!canceled && filePaths && filePaths.length > 0) {
                          onUpdateForm({
                            preferredIconType: 'image',
                            picturePath: filePaths[0],
                          });
                        }
                      })
                      .catch(console.log); // eslint-disable-line
                  }}
                >
                  Select Local Image...
                </Button>
                <Typography variant="caption" className={classes.caption}>
                  PNG, JPEG, GIF, TIFF or BMP.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.buttonBot}
                  disabled={Boolean(downloadingIcon)}
                  onClick={() => onGetIconFromInternet(true)}
                >
                  {downloadingIcon ? 'Downloading...' : 'Download Icon from URL'}
                </Button>
                <br />
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.buttonBot}
                  disabled={Boolean(downloadingIcon)}
                  onClick={() => onGetIconFromAppSearch(true)}
                >
                  {downloadingIcon ? 'Downloading...' : 'Download Icon from Our Database'}
                </Button>
                <br />
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.buttonBot}
                  disabled={Boolean(downloadingIcon)}
                  onClick={() => onUpdateForm({
                    picturePath: null,
                    internetIcon: null,
                  })}
                >
                  Reset to Default
                </Button>
              </>
            )}
          </div>
        </div>
        <FormGroup>
          <FormControlLabel
            control={(
              <Checkbox
                checked={transparentBackground}
                onChange={(e) => onUpdateForm({ transparentBackground: e.target.checked })}
              />
            )}
            label="Use transparent background"
          />
        </FormGroup>
      </div>
    </ListItem>
  );
};

ListItemIcon.defaultProps = {
  accountInfo: null,
  backgroundColor: null,
  internetIcon: null,
  picturePath: null,
  preferredIconType: 'auto',
};

ListItemIcon.propTypes = {
  accountInfo: PropTypes.object,
  backgroundColor: PropTypes.string,
  classes: PropTypes.object.isRequired,
  downloadingIcon: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  internetIcon: PropTypes.string,
  name: PropTypes.string.isRequired,
  onGetIconFromInternet: PropTypes.func.isRequired,
  onGetIconFromAppSearch: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  order: PropTypes.number.isRequired,
  picturePath: PropTypes.string,
  preferredIconType: PropTypes.oneOf(['auto', 'text', 'image', 'accountInfo']),
  shouldUseDarkColors: PropTypes.bool.isRequired,
  transparentBackground: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  accountInfo: state.dialogWorkspacePreferences.form.accountInfo,
  backgroundColor: state.dialogWorkspacePreferences.form.backgroundColor,
  downloadingIcon: state.dialogWorkspacePreferences.downloadingIcon,
  id: state.dialogWorkspacePreferences.form.id || '',
  internetIcon: state.dialogWorkspacePreferences.form.internetIcon,
  name: state.dialogWorkspacePreferences.form.name || '',
  order: state.dialogWorkspacePreferences.form.order || 0,
  picturePath: state.dialogWorkspacePreferences.form.picturePath,
  preferredIconType: state.dialogWorkspacePreferences.form.preferredIconType,
  shouldUseDarkColors: state.general.shouldUseDarkColors,
  transparentBackground: Boolean(state.dialogWorkspacePreferences.form.transparentBackground),
});

const actionCreators = {
  getIconFromInternet,
  getIconFromAppSearch,
  updateForm,
};

export default connectComponent(
  ListItemIcon,
  mapStateToProps,
  actionCreators,
  styles,
);
