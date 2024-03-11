export default {
  common: {
    labels: {
      columns: 'Kolommen',
      yes: 'Ja',
      no: 'Nee',
      new: 'Nieuw',
    },
    controls: {
      start: 'Start',
      stop: 'Stop',
      continue: 'Doorgaan',
      dismiss: 'Afwijzen',
      create: 'Aanmaken',
      save: 'Opslaan',
      cancel: 'Annuleren',
      delete: 'Verwijderen',
      expandAll: 'Open alles',
      collapseAll: 'Sluit alles',
    },
    properties: {
      displayName: 'Naam',
      color: 'Kleur',
      isBillable: 'Factureerbaar',
      lastUsed: 'Laatst gebruikt',
    },
    placeholders: {
      select: 'Kies...',
      search: 'Zoek...',
      searchEmpty: 'Geen resultaten',
      noEntries: '*stilte*',
    },
    colors: {
      noColor: 'Geen',
      red: 'Rood',
      orange: 'Oranje',
      amber: 'Amber',
      yellow: 'Geel',
      lime: 'Limoen',
      green: 'Groen',
      emerald: 'Smaragd',
      teal: 'Teal',
      cyan: 'Cyaan',
      sky: 'Lucht',
      blue: 'Blauw',
      indigo: 'Indigo',
      violet: 'Violet',
      purple: 'Paars',
      fuchsia: 'Fuchsia',
      pink: 'Roze',
      rose: 'Roos',
    },
    themes: {
      auto: 'Automatisch',
      dark: 'Donker',
      light: 'Licht',
      barf: 'Braaksel',
    },
    locales: {
      'en-US': 'Engels (Amerikaans)',
      'de-Informal': 'Duits (Informeel)',
      'nl-NL': 'Nederlands',
      'cat': 'Kattentaal',
    },
  },
  app: {
    nav: {
      dashboard: 'Start pagina',
      report: 'Raport',
      settings: 'Instellingen',
    },
  },
  project: {
    title: 'Project | Projecten',
    description: 'Gebruikt projecten om tijd bij te houden',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      isBillable: '@:common.properties.isBillable',
      isBreak: 'Pauze Project',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  activity: {
    title: 'Activiteit | Activiteiten',
    description: 'Activiteiten speciaal voor jou',
    properties: {
      displayName: '@:common.properties.displayName',
      color: '@:common.properties.color',
      lastUsed: '@:common.properties.lastUsed',
    },
  },
  reminder: {
    title: 'Herinnering | Herinneringen',
    description: 'Gebruik herinneringen voor opkomende evenementen',
    properties: {
      displayText: '@:common.properties.displayName',
      color: '@:common.properties.color',
      startAt: 'Tijd',
      remindBefore: 'Herinner voor',
      remindAfter: 'Herinner na',
      repeatOn: 'Herhaal op',
      actionType: 'Actie',
    },
    actionType: {
      'NO_ACTION': 'Geen actie',
      'START_EVENT': 'Start Evenement',
      'CONTINUE_PREVIOUS_EVENT': 'Ga verder met het vorige evenement',
      'STOP_CURRENT_EVENT': 'Stop het huidige evenement',
    }
  },
  dashboard: {
    header: {
      greeting: {
        morning: 'Goede morgen',
        noon: 'Good morgen',
        afternoon: 'Goede middag',
        evening: 'Goede avond',
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
      whatAreYouWorkingOn: null,
    }
  },
  report: {
    table: {
      columns: {
        date: 'Datum',
        totalDuration: 'Totaal',
      }
    },
    empty: {
      noProjects: {
        title: 'Geen tijd bijgehouden tot nu toe.',
        description: { term: 'Je hebt nog geen projecten. {0} om te starten met het bijhouden van je tijd.', createProject: 'Maak een project aan'},
      }
    }
  },
  settings: {
    projects: {
      title: 'Projecten',
      description: 'Hou je projecten en activiteiten bij.',
      controls: {
        createProject: 'Voeg een project toe',
        createActivity: 'Voeg een activiteit toe',
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
      title: 'Herinneringen',
      description: 'Hou je herinneringen bij',
      controls: {
        createReminder: 'Voeg een herinnering toe',
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
      title: 'Algemeen',
      description: 'Algemene kalender instellingen.',
      sections: {
        normalWorkingDuration: {
          title: 'Werk Uren',
          description: 'Hoeveel uur per dag moet je werken?',
        },
        break: {
          title: 'Werk Pauze',
          description: 'Je pauze tijd en project tijd word gebruikt om te berekenen hoeveel tijd je gebruikt voor pauzes. Pauzes hoeven niet factureerbaar te zijn.',
          sections: {
            breakTime: 'Pauze Tijd',
            breakProject: 'Pauze Project',
          }
        },
        autoStartActiveEventWhenTyping: {
          title: null,
          description: null,
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
      title: 'Thema',
      description: 'Verander hoe de app er uit ziet en voelt.',
      sections: {
        theme: {
          title: 'Thema',
          description: 'Hou jij van de Nachtwacht?',
        },
        language: {
          title: 'Taal',
          description: 'Welke taal spreek je?',
        }
      },
    },
  },
  dialog: {
    project: {
      new: {
        title: 'Nieuw Project',
        description: '@:project.description',
      },
      edit: {
        title: 'Weizig Project',
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
          description: 'Geef je leven een beetje kleur',
        },
        isBillable: {
          label: '@:project.properties.isBillable',
          description: 'Telt dit project mee met je bijgehouden tijd?',
        },
        isBreak: {
          label: '@:project.properties.isBreak',
          description: 'Dit project is bijgehouden als jouw pauze en zal anders berekend worden in je tijd berekeningen. Je kan dit weizigen in de algemene instellingen.',
        },
      }
    },
    activity: {
      new: {
        title: 'Nieuwe Activiteit',
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
          placeholder: 'Selecteer een project',
        },
        displayName: {
          placeholder: '@:activity.properties.displayName',
        },
        color: {
          label: '@:activity.properties.color',
          description: 'Voeg wat kleur toe aan je leven',
        },
      }
    },
    reminder: {
      new: {
        title: 'Nieuwe Herinnering',
        description: '@:reminder.description',
      },
      edit: {
        title: 'Weizig Reminder',
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