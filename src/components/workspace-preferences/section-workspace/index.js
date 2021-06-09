/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import connectComponent from '../../../helpers/connect-component';

import { updateForm } from '../../../state/dialog-workspace-preferences/actions';

import ListItemIcon from './list-item-icon';

const SectionWorkspace = ({
  name,
  homeUrl,
}) => (
  <List disablePadding dense>
    <ListItemIcon />
    <Divider />
    <ListItem
      button
      onClick={() => {}}
    >
      <ListItemText
        primary="Name"
        secondary={name}
      />
      <ChevronRightIcon color="action" />
    </ListItem>
    <Divider />
    <ListItem
      button
      onClick={() => {}}
    >
      <ListItemText
        primary="Home URL"
        secondary={homeUrl}
      />
      <ChevronRightIcon color="action" />
    </ListItem>
  </List>
);

SectionWorkspace.defaultProps = {
  name: '',
  homeUrl: '',
};

SectionWorkspace.propTypes = {
  name: PropTypes.string,
  homeUrl: PropTypes.string,
};

const mapStateToProps = (state) => ({
  homeUrl: state.dialogWorkspacePreferences.form.homeUrl,
  name: state.dialogWorkspacePreferences.form.name,
});

const actionCreators = {
  updateForm,
};

export default connectComponent(
  SectionWorkspace,
  mapStateToProps,
  actionCreators,
);
