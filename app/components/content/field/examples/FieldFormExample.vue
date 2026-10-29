<script setup lang="ts">
import Button from "~/reference/button/Button.vue";
import Field from "~/reference/field/Field.vue";
import Input from "~/reference/input/Input.vue";

/**
 * `::field-form-example`: a sign-up form with `novalidate`, whose fields are checked when
 * people leave them or submit, and which moves focus to the first error on a failed submit.
 */
type Name = "name" | "email" | "company";

const values = reactive<Record<Name, string>>({ name: "", email: "", company: "" });
const errors = reactive<Record<Name, string>>({ name: "", email: "", company: "" });
const status = ref("");
const fields = { name: useTemplateRef("name"), email: useTemplateRef("email"), company: useTemplateRef("company") };

// Each returns an error message, or an empty string when the value looks right.
const checks: Record<Name, (value: string) => string> = {
  name: (value) => (value.trim() ? "" : "Enter your full name"),
  email: (value) => {
    if (!value) return "Enter your email address";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter an email address in the correct format, like name@example.com";
    return "";
  },
  company: () => "",
};

// Only checks what people have typed, so tabbing past a field doesn't flag it.
function leave(name: Name) {
  if (values[name]) errors[name] = checks[name](values[name]);
}

function update(name: Name, value = "") {
  values[name] = value;
  // Once an error shows, check again as people type, so it clears as soon as it's fixed.
  if (errors[name]) errors[name] = checks[name](value);
}

async function submit() {
  for (const name of Object.keys(checks) as Name[]) errors[name] = checks[name](values[name]);
  const invalid = (Object.keys(checks) as Name[]).filter((name) => errors[name]);
  if (invalid.length) {
    status.value = `Couldn't create your account. ${invalid.length === 1 ? "There's 1 error" : `There are ${invalid.length} errors`} to fix.`;
    // Focus once the errors are in the page, so screen readers read the first one with its field.
    await nextTick();
    fields[invalid[0]!].value?.input?.focus();
    return;
  }
  status.value = "Your account is ready";
}
</script>

<template>
  <FieldExample>
    <form class="flex w-full max-w-sm flex-col gap-4" novalidate @submit.prevent="submit">
      <Field id="form-name" label="Full name" :error="errors.name" required>
        <Input
          ref="name"
          autocomplete="name"
          :model-value="values.name"
          @update:model-value="update('name', $event)"
          @blur="leave('name')"
        />
      </Field>
      <Field id="form-email" label="Email address" hint="We'll send a link to confirm it" :error="errors.email" required>
        <Input
          ref="email"
          type="email"
          autocomplete="email"
          :model-value="values.email"
          @update:model-value="update('email', $event)"
          @blur="leave('email')"
        />
      </Field>
      <Field id="form-company" label="Company (optional)">
        <Input
          ref="company"
          autocomplete="organization"
          :model-value="values.company"
          @update:model-value="update('company', $event)"
        />
      </Field>
      <div class="flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">Create account</Button>
        <!-- Always in the page, so screen readers announce what it says. -->
        <p role="status" class="text-muted text-sm">{{ status }}</p>
      </div>
    </form>
    <template v-if="$slots.default" #code><slot /></template>
  </FieldExample>
</template>
