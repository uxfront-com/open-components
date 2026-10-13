<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Card from "~/reference/card/Card.vue";

/** `::card-languages-example`: a card in a right-to-left language, which mirrors itself. */
</script>

<template>
  <CardExample>
    <Card dir="rtl" lang="ar" heading="المحرك التحليلي" href="#analytical-engine" class="w-full max-w-xs">
      <template #eyebrow>مشروع</template>
      <template #media><CardExampleArt /></template>
      <p>تصميم تشارلز باباج لحاسوب ميكانيكي عام الغرض، وُصف لأول مرة عام 1837.</p>
      <template #actions><Button size="sm" variant="outline">حفظ</Button></template>
    </Card>
    <template v-if="$slots.default" #code><slot /></template>
  </CardExample>
</template>
