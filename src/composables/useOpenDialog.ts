import {useDialogStore} from "@/stores/dialogStore";
import type {Component} from "vue";
import {h} from "vue";

export function useOpenDialog(component: Component) {
  const dialogStore = useDialogStore()

  dialogStore.openDialog(h(component))
}