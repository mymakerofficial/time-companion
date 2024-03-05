import { Temporal } from 'temporal-polyfill'
import {createService} from "@/composables/createService";
import {useSettingsStore} from "@/stores/settingsStore";
import {reactive} from "vue";
import {mapWritable} from "@/model/modelHelpers";

export interface WorkingDurationService {
  workingDuration: Temporal.Duration
}

export const useWorkingDurationService = createService(() => {
  const store = useSettingsStore()

  return reactive({
    ...mapWritable(store, [
      'workingDuration'
    ]),
  })
})