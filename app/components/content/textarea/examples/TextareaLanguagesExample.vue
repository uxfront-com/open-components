<script setup lang="ts">
import Textarea from "~/reference/textarea/Textarea.vue";

/** `::textarea-languages-example`: a right-to-left form, with a textarea that follows what people type. */
</script>

<template>
  <TextareaExample>
    <div dir="rtl" lang="ar" class="flex w-full max-w-md flex-col gap-1.5">
      <label for="languages-message" class="text-sm font-medium">الرسالة</label>
      <Textarea id="languages-message" dir="auto" :rows="3" value="مرحبا، هل يمكننا تأجيل الاجتماع؟" />
    </div>
    <template v-if="$slots.default" #code><slot /></template>
  </TextareaExample>
</template>
