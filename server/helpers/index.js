import i18next from 'i18next';
import _ from 'lodash';

export const getDefaultOptions = (app) => ({
  preValidation: app.fp.authenticate(
    'form',
    {
      failureRedirect: app.reverse('root'),
      failureFlash: i18next.t('flash.authError'),
    },
  ),
});

export default (app) => ({
  route(name, id) {
    return app.reverse(name, { id });
  },
  t(key) {
    return i18next.t(key);
  },
  _,
  getAlertClass(type) {
    switch (type) {
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        throw new Error(`Unknown flash type: '${type}'`);
    }
  },
  formatDate(str) {
    const date = new Date(str);
    return date.toLocaleString();
  },
});
