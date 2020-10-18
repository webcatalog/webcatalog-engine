import {
  UPDATE_CODE_INJECTION_FORM,
  OPEN_CODE_INJECTION_FORM,
  CLOSE_CODE_INJECTION_FORM,
} from '../../constants/actions';
import {
  requestSetPreference,
  requestShowRequireRestartDialog,
} from '../../senders';

import { updateForm as updateFormDialogWorkspacePreferences } from '../dialog-workspace-preferences/actions';

export const open = (codeInjectionType) => (dispatch, getState) => {
  if (window.mode === 'workspace-preferences') {
    const { form } = getState().dialogWorkspacePreferences;
    dispatch({
      type: OPEN_CODE_INJECTION_FORM,
      codeInjectionType,
      form: {
        code: form[`${codeInjectionType}CodeInjection`],
        // allowNodeInJsCodeInjection is only used for js injection
        allowNodeInJsCodeInjection: codeInjectionType === 'js' ? form.allowNodeInJsCodeInjection : false,
      },
    });
    return;
  }

  const { preferences } = getState();
  dispatch({
    type: OPEN_CODE_INJECTION_FORM,
    codeInjectionType,
    form: {
      code: preferences[`${codeInjectionType}CodeInjection`],
      // allowNodeInJsCodeInjection is only used for js injection
      allowNodeInJsCodeInjection: codeInjectionType === 'js' ? preferences.allowNodeInJsCodeInjection : false,
    },
  });
};

export const close = () => ({
  type: CLOSE_CODE_INJECTION_FORM,
});

export const updateForm = (changes) => (dispatch) => dispatch({
  type: UPDATE_CODE_INJECTION_FORM,
  changes,
});

export const save = () => (dispatch, getState) => {
  const { form, codeInjectionType } = getState().dialogCodeInjection;

  if (window.mode === 'workspace-preferences') {
    dispatch(updateFormDialogWorkspacePreferences({
      [`${codeInjectionType}CodeInjection`]: form.code,
      allowNodeInJsCodeInjection: codeInjectionType === 'js' ? form.allowNodeInJsCodeInjection : undefined,
    }));
  } else {
    requestSetPreference(`${codeInjectionType}CodeInjection`, form.code);
    if (codeInjectionType === 'js' && typeof form.allowNodeInJsCodeInjection === 'boolean') {
      requestSetPreference('allowNodeInJsCodeInjection', form.allowNodeInJsCodeInjection);
    }
  }

  dispatch(close());
  requestShowRequireRestartDialog();
};
