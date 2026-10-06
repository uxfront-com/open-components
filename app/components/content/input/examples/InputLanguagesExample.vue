<script setup lang="ts">
import Input from "~/reference/input/Input.vue";

/** `::input-languages-example`: a right-to-left form, with an email address that runs left to right. */
</script>

<template>
  <InputExample>
    <div dir="rtl" lang="ar" class="flex w-full max-w-sm flex-col gap-5">
      <div class="flex flex-col gap-1.5">
        <label for="languages-name" class="text-sm font-medium">الاسم</label>
        <Input id="languages-name" dir="auto" autocomplete="name" value="ليلى" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="languages-email" class="text-sm font-medium">البريد الإلكتروني</label>
        <Input id="languages-email" type="email" dir="ltr" autocomplete="email" value="layla@example.com">
          <template #leading><UIcon name="i-lucide-mail" mode="svg" /></template>
        </Input>
      </div>
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </InputExample>
</template>
