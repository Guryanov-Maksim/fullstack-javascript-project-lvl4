export default {
  translation: {
    appName: 'Менеджер задач',
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        statuses: 'Статусы',
        tasks: 'Задачи',
        labels: 'Метки',
      },
    },
    views: {
      labels: {
        header: 'Метки',
        id: 'ID',
        name: 'Наименование',
        create: 'Создать метку',
        createdAt: 'Дата создания',
        new: {
          create: 'Создать',
          header: 'Создание метки',
          name: 'Наименование',
        },
        edit: {
          change: 'Изменить',
          delete: 'Удалить',
          header: 'Изменение метки',
        },
      },
      session: {
        new: {
          email: 'Email',
          password: 'Пароль',
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      statuses: {
        header: 'Статусы',
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        create: 'Создать статус',
        edit: {
          change: 'Изменить',
          delete: 'Удалить',
          header: 'Изменение статуса',
        },
        new: {
          create: 'Создать',
          header: 'Создание статуса',
          name: 'Наименование',
        },
      },
      tasks: {
        header: 'Задачи',
        id: 'ID',
        name: 'Наименование',
        create: 'Создать задачу',
        status: 'Статус',
        author: 'Автор',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
        new: {
          create: 'Создать',
          header: 'Создание задачи',
          name: 'Наименование',
          description: 'Описание',
          statusId: 'Статус',
          executorId: 'Исполнитель',
          labels: 'Метка',
        },
        edit: {
          header: 'Изменение задачи',
          change: 'Изменить',
          delete: 'Удалить',
        },
        filter: {
          status: 'Статус',
          executor: 'Исполнитель',
          label: 'Метка',
          isCreatorUser: 'Только мои задачи',
          show: 'Показать',
        },
        show: {
          createdAt: 'Дата создания',
          creator: 'Автор',
          executor: 'Исполнитель',
          change: 'Изменить',
          delete: 'Удалить',
        },
      },
      users: {
        new: {
          signUp: 'Регистрация',
          submit: 'Сохранить',
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
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        edit: {
          success: 'Метка успешно изменена',
          error: 'Не удалось изменить метку',
        },
        delete: {
          success: 'Метка успешно удалёна',
          error: 'Не удалось удалить метку',
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
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        delete: {
          success: 'Статус успешно удалён',
          error: 'Не удалось удалить статус',
        },
        edit: {
          success: 'Статус успешно изменён',
          error: 'Не удалось изменить статус',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          success: 'Задача успешно удалена',
          accessError: 'Задачу может удалить только её автор',
        },
        edit: {
          success: 'Задача успешно изменена',
          error: 'Не удалось изменить задачу',
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
        error: 'Не удалось удалить пользователя',
      },
    },
  },
};
