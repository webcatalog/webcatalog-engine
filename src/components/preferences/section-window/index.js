/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';

import connectComponent from '../../../helpers/connect-component';

import {
  enqueueRequestRestartSnackbar,
  requestSetPreference,
} from '../../../senders';

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(3),
    border: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
  },
  sliderContainer: {
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
  },
  sliderTitleContainer: {
    paddingTop: `${theme.spacing(1.5)}px !important`,
    width: 100,
  },
  sliderMarkLabel: {
    fontSize: '0.75rem',
  },
  selectRoot: {
    borderRadius: theme.spacing(0.5),
    fontSize: '0.84375rem',
  },
  selectRootExtraMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  select: {
    paddingTop: theme.spacing(1),
    paddingRight: 26,
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1.5),
  },
});

const SectionAppearance = ({
  windowButtons,
  useSystemTitleBar,
}) => (
  <>
    <List disablePadding dense>
      {window.process.platform === 'darwin' ? (
        <ListItem>
          <ListItemText
            primary="Show window buttons"
            secondary={'Show "traffic light" (red/yellow/green) buttons.'}
          />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              color="primary"
              checked={windowButtons}
              onChange={(e) => {
                requestSetPreference('windowButtons', e.target.checked);
                enqueueRequestRestartSnackbar();
              }}
            />
          </ListItemSecondaryAction>
        </ListItem>
      ) : (
        <>
          <ListItem>
            <ListItemText
              primary="Use native title bar and borders"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                color="primary"
                checked={useSystemTitleBar}
                onChange={(e) => {
                  requestSetPreference('useSystemTitleBar', e.target.checked);
                  enqueueRequestRestartSnackbar();
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </>
      )}
    </List>
  </>
);

SectionAppearance.propTypes = {
  windowButtons: PropTypes.bool.isRequired,
  useSystemTitleBar: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  windowButtons: state.preferences.windowButtons,
  useSystemTitleBar: state.preferences.useSystemTitleBar,
});

export default connectComponent(
  SectionAppearance,
  mapStateToProps,
  null,
  styles,
);
