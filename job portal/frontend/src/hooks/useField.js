// hooks/useField.js
export const useField = (name, { control, setValue, watch, register, formState }) => {
    return {
        value: watch(name),
        onChange: (e) => setValue(name, e.target.value, { shouldValidate: true }),
        error: formState.errors[name]?.message,
    };
};