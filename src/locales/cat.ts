export default {
  common: {
    labels: {
      columns: 'Meow',
      yes: '*purr*',
      no: '*hiss*',
      new: 'Meow',
    },
    controls: {
      start: 'Meow',
      stop: 'Mrrp',
      continue: 'Meooow',
      dismiss: 'Prrr',
      create: 'Meeeooow',
      save: 'Meow',
      cancel: 'Meeeoooww',
      delete: '*hisss*',
      expandAll: 'Meow Meoooww',
      collapseAll: 'Meow Meow',
    },
    properties: {
      displayName: 'Meow',
      color: 'Meow',
      isBillable: 'Meeoow Meow',
      lastUsed: 'Meow prrr',
    },
    placeholders: {
      select: 'Meow...',
      search: 'Meow...',
      searchEmpty: 'prrr',
      noEntries: '*meow*',
    },
    colors: {
      noColor: 'Meow',
      red: 'Meow',
      orange: 'Meow',
      amber: 'Meow',
      yellow: 'Meow',
      lime: 'Meow',
      green: 'Meow',
      emerald: 'Meow',
      teal: 'Meow',
      cyan: 'Meow',
      sky: 'Meow',
      blue: 'Meow',
      indigo: 'Meow',
      violet: 'Meow',
      purple: 'Meow',
      fuchsia: 'Meow',
      pink: 'Meow',
      rose: 'Meow',
    },
    themes: {
      auto: 'Meooow Meow',
      dark: 'Meow',
      light: 'Meow',
      barf: 'Meow',
    },
    locales: {
      'en-US': 'Meow (Ameowrican)',
      'de-Informal': 'Meow (Meow)',
      'nl-NL': 'Meow',
      'cat': 'pspsps',
    },
  },
  app: {
    nav: {
      dashboard: 'Meow meow',
      report: 'Meow',
      settings: 'Mrrrrrp',
    },
  },
  project: {
    title: 'Meow | Meeooow',
    description: 'Meeooooww mrrrp prrr meow meow',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      isBillable: '@:common.properties.isBillable',
      isBreak: 'Meow meow',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  activity: {
    title: 'Meeow | Meeooow',
    description: 'Meow meow meeooww',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  reminder: {
    title: 'Meow | Meeoow',
    description: 'Meow mrrrp meow',
    properties: {
      displayText: '@:common.properties.displayName',
      color: '@:common.properties.color',
      startAt: 'prrr',
      remindBefore: 'Meow',
      remindAfter: 'Meow',
      repeatOn: 'Meooow',
      actionType: 'Meow',
    },
    actionType: {
      'NO_ACTION': '*hiss*',
      'START_EVENT': 'Meow',
      'CONTINUE_PREVIOUS_EVENT': 'Meoow',
      'STOP_CURRENT_EVENT': 'Meooow',
    }
  },
  dashboard: {
    header: {
      greeting: {
        morning: 'Meow Meeeow Meeeoooooow Meooooow Meeeoooow',
        noon: 'Meow Meoow',
        afternoon: 'Meow Meooow',
        evening: 'Meoow Meeoooow Meeeooooow Meooooow',
      },
    },
    controls: {
      startEvent: '@:common.controls.start',
      stopEvent: '@:common.controls.stop',
      continueEvent: '@:common.controls.continue',
      deleteEvent: '@:common.controls.delete',
      dismissReminder: '@:common.controls.dismiss',
    },
    labels: {
      whatAreYouWorkingOn: 'Meow meow?...',
    }
  },
  report: {
    table: {
      columns: {
        date: 'Meow',
        totalDuration: 'Meeoow',
      }
    },
    empty: {
      noProjects: {
        title: 'Meeooow prrr',
        description: { term: 'Meow meow meoow meow. {0} meow meow meoow.', createProject: 'Meow'},
      }
    }
  },
  settings: {
    projects: {
      title: 'Meow',
      description: 'Meow prrr',
      controls: {
        createProject: 'Meow mrrrp',
        createActivity: 'Meow meow',
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
      title: 'Meow',
      description: 'Mouw mrrrp prrr',
      controls: {
        createReminder: 'Meooow Meow Meoow',
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
      title: 'Meooow',
      description: 'Meooow Meow Meoooow',
      sections: {
        normalWorkingDuration: {
          title: 'Meow mrrrp',
          description: 'Meoooow meow meow?',
        },
        break: {
          title: 'Meow',
          description: 'Meow.',
          sections: {
            breakTime: 'Meoow meow',
            breakProject: 'Meooow mrrrp',
          }
        },
        autoStartActiveEventWhenTyping: {
          title: 'Meow Meow',
          description: 'Meow Meow Meow Meow Meow',
        },
        stopActiveEventWithBackspace: {
          title: null,
          description: null,
        },
        minimumEventDuration: {
          title: null,
          description: null,
        }
      },
    },
    appearance: {
      title: 'Meow',
      description: 'Meooow meow',
      sections: {
        theme: {
          title: 'Meow',
          description: 'mrrrp?',
        },
        language: {
          title: 'Meow',
          description: 'Meow?',
        }
      },
    },
  },
  dialog: {
    project: {
      new: {
        title: 'Meow meow',
        description: '@:project.description',
      },
      edit: {
        title: 'Meow meow',
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
          description: 'Meow mrrrp',
        },
        isBillable: {
          label: '@:project.properties.isBillable',
          description: 'Meow meow meeooow?',
        },
        isBreak: {
          label: '@:project.properties.isBreak',
          description: 'Meow',
        },
      }
    },
    activity: {
      new: {
        title: 'Meow meow',
        description: '@:activity.description',
      },
      edit: {
        title: 'Weizig Activiteit',
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
          placeholder: 'Meow meow meow',
        },
        displayName: {
          placeholder: '@:activity.properties.displayName',
        },
        color: {
          label: '@:activity.properties.color',
          description: 'Meow',
        },
      }
    },
    reminder: {
      new: {
        title: 'Meow',
        description: '@:reminder.description',
      },
      edit: {
        title: 'Meow',
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
          label: 'Meow meow'
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