import isEmail from 'validator/lib/isEmail';

export function email(value: string) {
    return value && !isEmail(value.trim()) ? 'Invalid email' : null;
}

function isDirty(value: string | number) {
    return value || value === 0;
}

export function required(requiredFields: readonly string[], values: Record<string, string>): Record<string, string> {
    return requiredFields.reduce(
        (fields, field) => ({
            ...fields,
            ...(isDirty(values[field]) ? undefined : { [field]: 'Required' }),
        }),
        {}
    );
}
