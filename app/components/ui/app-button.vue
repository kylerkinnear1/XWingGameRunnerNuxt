<script setup lang="ts">
type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "md",
    disabled: false,
    type: "button",
  }
);

const buttonStyles = computed(() => {
  // Only apply disabled style if explicitly disabled
  if (props.disabled === true) {
    return { backgroundColor: 'rgb(55 65 81)' }; // gray-700
  }
  const styles = {
    primary: { backgroundColor: 'rgb(13 148 136)' }, // teal-600
    secondary: { backgroundColor: 'rgb(75 85 99)' }, // gray-600
    accent: { backgroundColor: 'rgb(234 88 12)' }, // orange-600
  };
  return styles[props.variant];
});
</script>

<template>
  <button
    :type="type"
    :disabled="props.disabled"
    :class="[
      'font-semibold',
      'transition-all',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      // Size classes
      props.size === 'sm' && 'px-3 py-1.5 text-sm rounded',
      props.size === 'md' && 'px-4 py-2 text-base rounded',
      props.size === 'lg' && 'px-6 py-3 text-lg rounded-lg',
      // Variant classes - primary
      props.variant === 'primary' && 'bg-teal-600 hover:bg-teal-700 border-teal-800 hover:border-teal-900 disabled:bg-gray-700 disabled:text-gray-500 text-white',
      // Variant classes - secondary
      props.variant === 'secondary' && 'bg-gray-600 hover:bg-gray-500 border-gray-700 hover:border-gray-600 disabled:bg-gray-700 disabled:text-gray-500 text-gray-200',
      // Variant classes - accent
      props.variant === 'accent' && 'bg-orange-600 hover:bg-orange-700 border-orange-800 hover:border-orange-900 disabled:bg-gray-700 disabled:text-gray-500 text-white',
      // Shadow and border for large size
      props.size === 'lg' && 'shadow-2xl border-b-4',
    ]"
    :style="buttonStyles"
  >
    <slot />
  </button>
</template>

