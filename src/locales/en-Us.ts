export default {
  common: {
    labels: {
      columns: 'Columns',
      yes: 'Yes',
      no: 'No',
    },
    controls: {
      start: 'Start',
      stop: 'Stop',
      continue: 'Continue',
      dismiss: 'Dismiss',
      create: 'Create',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
    },
    properties: {
      displayName: 'Name',
      color: 'Color',
      isBillable: 'Billable',
      lastUsed: 'Last used',
    },
    placeholders: {
      select: 'Select...',
      search: 'Search...',
      searchEmpty: 'No results',
      noEntries: '*crickets*',
    },
    colors: {
      noColor: 'None',
      red: 'Red',
      orange: 'Orange',
      amber: 'Amber',
      yellow: 'Yellow',
      lime: 'Lime',
      green: 'Green',
      emerald: 'Emerald',
      teal: 'Teal',
      cyan: 'Cyan',
      sky: 'Sky',
      blue: 'Blue',
      indigo: 'Indigo',
      violet: 'Violet',
      purple: 'Purple',
      fuchsia: 'Fuchsia',
      pink: 'Pink',
      rose: 'Rose',
    },
    themes: {
      auto: 'Auto',
      dark: 'Dark',
      light: 'Light',
    },
    locales: {
      'en-US': 'English',
      'de-Informal': 'German (Informal)',
    },
  },
  app: {
    nav: {
      dashboard: 'Dashboard',
      report: 'Report',
      settings: 'Settings',
    },
  },
  project: {
    title: 'Project | Projects',
    description: 'Use projects to track your time',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      isBillable: '@:common.properties.isBillable',
      isBreak: 'Break Project',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  activity: {
    title: 'Activity | Activities',
    description: 'Activities are just for you',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  reminder: {
    title: 'Reminder | Reminders',
    description: 'Use reminders to remind you of upcoming events',
    properties: {
      displayText: '@:common.properties.displayName',
      color: '@:common.properties.color',
      startAt: 'Time',
      remindBefore: 'Remind Before',
      remindAfter: 'Remind After',
      repeatOn: 'Repeat on',
      actionType: 'Action',
    },
    actionType: {
      'NO_ACTION': 'No Action',
      'START_EVENT': 'Start Event',
      'CONTINUE_PREVIOUS_EVENT': 'Continue Previous Event',
      'STOP_CURRENT_EVENT': 'Stop Current Event',
    }
  },
  dashboard: {
    header: {
      greeting: {
        morning: 'Good morning',
        noon: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
      },
    },
    controls: {
      startEvent: '@:common.controls.start',
      stopEvent: '@:common.controls.stop',
      continueEvent: '@:common.controls.continue',
      deleteEvent: '@:common.controls.delete',
      dismissReminder: '@:common.controls.dismiss',
    }
  },
  report: {
    table: {
      columns: {
        date: 'Date',
        totalDuration: 'Total',
      }
    },
    empty: {
      noProjects: {
        title: 'No time tracked yet.',
        description: { term: 'You dont have any projects yet. {0} to start tracking time.', createProject: 'Create one'},
      }
    }
  },
  settings: {
    projects: {
      title: 'Projects',
      description: 'Manage your projects and activities',
      controls: {
        createProject: 'Add Project',
        createActivity: 'Add Activity',
      },
      table: {
        columns: {
          name: '@:project.properties.displayName',
          color: '@:project.properties.color',
          isBillable: '@:project.properties.isBillable',
          lastUsed: '@:project.properties.lastUsed',
        }
      }
    },
    reminders: {
      title: 'Reminders',
      description: 'Manage your reminders',
      controls: {
        createReminder: 'Add Reminder',
      },
      table: {
        columns: {
          name: '@:reminder.properties.displayText',
          startAt: '@:reminder.properties.startAt',
          repeatOn: '@:reminder.properties.repeatOn',
          action: '@:reminder.properties.actionType',
        }
      }
    },
    general: {
      title: 'General',
      description: 'General calendar settings',
      sections: {
        normalWorkingDuration: {
          title: 'Working Hours',
          description: 'How many hours do you work per day?',
        },
        break: {
          title: 'Work Breaks',
          description: 'Your break time and project are used to calculate how much time you spend on breaks. Break projects may not be billable.',
          sections: {
            breakTime: 'Break Time',
            breakProject: 'Break Project',
          }
        },
      },
    },
    appearance: {
      title: 'Appearance',
      description: 'Customize the look and feel of the app',
      sections: {
        theme: {
          title: 'Theme',
          description: 'Are you joining the dark side?',
        },
        language: {
          title: 'Language',
          description: 'What language do you speak?',
        }
      },
    },
  },
  dialog: {
    project: {
      new: {
        title: 'New Project',
        description: '@:project.description',
      },
      edit: {
        title: 'Edit Project',
        description: '@:project.description',
      },
      controls: {
        create: '@:common.controls.create',
        save: '@:common.controls.save',
        cancel: '@:common.controls.cancel',
        delete: '@:common.controls.delete',
      },
      form: {
        displayName: {
          label: '@:project.properties.displayName',
          placeholder: '@:project.properties.displayName',
        },
        color: {
          label: '@:project.properties.color',
          description: 'Give your life some color',
        },
        isBillable: {
          label: '@:project.properties.isBillable',
          description: 'Does this project count towards your tracked time?',
        },
        isBreak: {
          label: '@:project.properties.isBreak',
          description: 'This project is set as your break and will be counted differently for time calculations. You can change this in the "General" settings.',
        },
      }
    },
    activity: {
      new: {
        title: 'New Activity',
        description: '@:activity.description',
      },
      edit: {
        title: 'Edit Activity',
        description: '@:activity.description',
      },
      controls: {
        create: '@:common.controls.create',
        save: '@:common.controls.save',
        cancel: '@:common.controls.cancel',
        delete: '@:common.controls.delete'
      },
      form: {
        parentProject: {
          label: '@:project.title',
          placeholder: 'Select project',
        },
        displayName: {
          placeholder: '@:activity.properties.displayName',
        },
        color: {
          label: '@:activity.properties.color',
          description: 'Give your life some color',
        },
      }
    },
    reminder: {
      new: {
        title: 'New Reminder',
        description: '@:reminder.description',
      },
      edit: {
        title: 'Edit Reminder',
        description: '@:reminder.description',
      },
      controls: {
        create: '@:common.controls.create',
        save: '@:common.controls.save',
        cancel: '@:common.controls.cancel',
        delete: '@:common.controls.delete'
      },
      form: {
        displayText: {
          label: '@:reminder.properties.displayText'
        },
        actionType: {
          label: '@:reminder.properties.actionType'
        },
        actionTarget: {
          label: 'Start project'
        },
        color: {
          label: '@:reminder.properties.color'
        },
        startAt: {
          label: '@:reminder.properties.startAt'
        },
        repeatOn: {
          label: '@:reminder.properties.repeatOn'
        },
        remindBefore: {
          label: '@:reminder.properties.remindBefore'
        },
        remindAfter: {
          label: '@:reminder.properties.remindAfter'
        },
      }
    }
  },
}