<template>
  <div class="mb-8 flex flex-row justify-between items-center gap-4">
    <span class="flex flex-row justify-end items-center gap-4"><slot name="left" /></span>
    <span class="flex flex-row justify-end items-center gap-4"><slot name="right"><slot /></slot></span>
  </div>
</template>