export default {
  translation: {
    appName: 'Менеджер задач',
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          mail: 'Email',
          password: 'Пароль',
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        new: {
          signUp: 'Регистрация',
          submit: 'Отправить',
          firstName: 'Имя',
          lastName: 'Фамилия',
          password: 'Пароль',
          email: 'Email',
        },
        id: 'ID',
        fullName: 'Полное имя',
        email: 'Email',
        createdAt: 'Дата создания',
        actions: 'Действия',
        header: 'Пользователи',
        edit: {
          change: 'Изменить',
          delete: 'Удалить',
          header: 'Изменение пользователя',
          send: 'Отправить',
        },
      },
    },
    flash: {
      users: {
        create: {
          success: 'Пользователь успешно зарегистрирован',
          error: 'Не удалось зарегистрировать',
        },
      },
      session: {
        create: {
          error: 'Неправильный емейл или пароль',
          success: 'Вы залогинены',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
      edit: {
        accessError: 'Вы не можете редактировать или удалять другого пользователя',
        error: 'Не удалось изменить пользователя',
        success: 'Пользователь успешно изменён',
      },
      delete: {
        success: 'Пользователь успешно удалён',
      },
    },
  },
};
