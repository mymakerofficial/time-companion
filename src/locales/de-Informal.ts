export default {
  common: {
    labels: {
      columns: 'Spalten',
      yes: 'Ja',
      no: 'Nein',
    },
    controls: {
      start: 'Start',
      stop: 'Stop',
      continue: 'Weiter',
      dismiss: 'Schließen',
      create: 'Erstellen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
    },
    properties: {
      displayName: 'Name',
      color: 'Farbe',
      isBillable: 'Abrechenbar',
      lastUsed: 'Zuletzt verwendet',
    },
    placeholders: {
      select: 'Auswählen...',
      search: 'Suche...',
      searchEmpty: 'Keine Ergebnisse',
      noEntries: '*Stille*',
    },
    colors: {
      noColor: 'Keine',
      red: 'Rot',
      orange: 'Orange',
      amber: 'Bernstein',
      yellow: 'Gelb',
      lime: 'Limette',
      green: 'Grün',
      emerald: 'Smaragd',
      teal: 'Blaugrün',
      cyan: 'Cyan',
      sky: 'Himmelblau',
      blue: 'Blau',
      indigo: 'Indigo',
      violet: 'Violett',
      purple: 'Lila',
      fuchsia: 'Fuchsia',
      pink: 'Pink',
      rose: 'Rose',
    },
    themes: {
      dark: 'Dunkel',
      light: 'Hell',
    },
    locales: {
      'en-US': 'Englisch',
      'de-Informal': 'Deutsch (Du)',
    },
  },
  app: {
    nav: {
      dashboard: 'Zeiterfassung',
      report: 'Bericht',
      settings: 'Einstellungen',
    },
  },
  project: {
    title: 'Projekt | Projekte',
    description: 'Projekte verfolgen deine Zeit',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      isBillable: '@:common.properties.isBillable',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  activity: {
    title: 'Aktivität | Aktivitäten',
    description: 'Aktivitäten sind nur für dich',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  reminder: {
    title: 'Erinnerung | Erinnerungen',
    description: 'Nutze Erinnerungen, um dich an anstehende Ereignisse zu erinnern',
    properties: {
      displayText: '@:common.properties.displayName',
      color: '@:common.properties.color',
      remindAt: 'Zeit',
      remindMinutesBefore: 'Vorher anzeigen',
      remindMinutesAfter: 'Nachher anzeigen',
      repeatOn: 'Wiederholen an',
      actionType: 'Aktion',
    },
    actionType: {
      'NO_ACTION': 'Keine Aktion',
      'START_EVENT': 'Starte Ereignis',
      'CONTINUE_PREVIOUS_EVENT': 'Vorheriges Ereignis fortsetzen',
      'STOP_CURRENT_EVENT': 'Aktuelles Ereignis beenden',
    }
  },
  dashboard: {
    header: {
      greeting: {
        morning: 'Guten Morgen',
        noon: 'Guten Mittag',
        afternoon: 'Guten Nachmittag',
        evening: 'Guten Abend',
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
        date: 'Datum',
        totalDuration: 'Gesamtzeit',
      }
    },
    empty: {
      noProjects: {
        title: 'Nichts zu sehen',
        description: { term: 'Du hast noch keine Projekte. {0} um lost zu legen.', createProject: 'Erstelle eins'},
      }
    }
  },
  settings: {
    projects: {
      title: 'Projekte',
      description: 'Verwalte deine Projekte und Aktivitäten',
      controls: {
        createProject: 'Projekt hinzufügen',
        createActivity: 'Aktivität hinzufügen',
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
      title: 'Erinnerungen',
      description: 'Verwalte deine Erinnerungen',
      controls: {
        createReminder: 'Erinnerung hinzufügen',
      },
      table: {
        columns: {
          name: '@:reminder.properties.displayText',
          remindAt: '@:reminder.properties.remindAt',
          repeatOn: '@:reminder.properties.repeatOn',
          action: '@:reminder.properties.actionType',
        }
      }
    },
    appearance: {
      title: 'Aussehen',
      description: 'Mach dir die Welt, wie sie dir gefällt.',
      sections: {
        theme: {
          title: 'Thema',
          description: 'Schließe dich der dunklen Seite an?',
        },
        language: {
          title: 'Sprache',
          description: 'Sprache ändern',
        }
      }
    },
  },
  dialog: {
    project: {
      new: {
        title: 'Neues Projekt',
        description: '@:project.description',
      },
      edit: {
        title: 'Projekt bearbeiten',
        description: '@:project.description',
      },
      controls: {
        create: '@:common.controls.create',
        save: '@:common.controls.save',
        cancel: '@:common.controls.cancel',
        delete: '@:common.controls.delete'
      },
      form: {
        displayName: {
          label: '@:project.properties.displayName',
          placeholder: '@:project.properties.displayName',
        },
        color: {
          label: '@:project.properties.color',
          description: 'Gebe deinen Leben etwas Farbe',
        },
        isBillable: {
          label: '@:project.properties.isBillable',
          description: 'Sollte dieses Projekt in Rechnung gestellt werden?',
        },
      }
    },
    activity: {
      new: {
        title: 'Neue Aktivität',
        description: '@:activity.description',
      },
      edit: {
        title: 'Aktivität bearbeiten',
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
          placeholder: 'Projekt auswählen',
        },
        displayName: {
          placeholder: '@:activity.properties.displayName',
        },
        color: {
          label: '@:activity.properties.color',
          description: 'Gebe deinen Leben etwas Farbe',
        },
      }
    },
    reminder: {
      new: {
        title: 'Neue Erinnerung',
        description: '@:reminder.description',
      },
      edit: {
        title: 'Erinnerung bearbeiten',
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
          label: 'Startet projekt'
        },
        color: {
          label: '@:reminder.properties.color'
        },
        remindAt: {
          label: '@:reminder.properties.remindAt'
        },
        repeatOn: {
          label: '@:reminder.properties.repeatOn'
        },
        remindMinutesBefore: {
          label: '@:reminder.properties.remindMinutesBefore'
        },
        remindMinutesAfter: {
          label: '@:reminder.properties.remindMinutesAfter'
        },
      }
    }
  },
}