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
  const baseStyles = {
    fontWeight: "600",
    transition: "all 0.2s",
    cursor: props.disabled ? "not-allowed" : "pointer",
    color: "white",
    border: "none",
    opacity: props.disabled ? "0.5" : "1",
  };

  // Size styles
  const sizeStyles = {
    sm: {
      padding: "0.375rem 0.75rem",
      fontSize: "0.875rem",
      borderRadius: "0.25rem",
    },
    md: { padding: "0.5rem 1rem", fontSize: "1rem", borderRadius: "0.25rem" },
    lg: {
      padding: "0.75rem 1.5rem",
      fontSize: "1.125rem",
      borderRadius: "0.5rem",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      borderBottom: "4px solid",
    },
  };

  // Variant styles
  let variantStyles = {};
  if (props.disabled) {
    variantStyles = {
      backgroundColor: "#374151", // gray-700
      borderColor: "#1f2937", // gray-800
      color: "#6b7280", // gray-500
    };
  } else {
    const variants = {
      primary: { backgroundColor: "#0d9488", borderColor: "#115e59" }, // teal
      secondary: {
        backgroundColor: "#4b5563",
        borderColor: "#374151",
        color: "#e5e7eb",
      }, // gray
      accent: { backgroundColor: "#ea580c", borderColor: "#9a3412" }, // orange
    };
    variantStyles = variants[props.variant];
  }

  return { ...baseStyles, ...sizeStyles[props.size], ...variantStyles };
});
</script>

<template>
  <button :type="type" :disabled="props.disabled" :style="buttonStyles">
    <slot />
  </button>
</template>
