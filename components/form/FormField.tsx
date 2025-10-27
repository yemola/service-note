import { useFormikContext } from "formik";

import FloatingLabelInput from "../FloatingLabelInput";
// import TextInput from "../TextInput";
// import ErrorMessage from "./ErrorMessage";

type AppFormFieldProps = {
    name: string; // The name of the field in the form values
    width?: string | number; // Optional width of the TextInput
    [key: string]: any; // For any additional props passed to TextInput
};

function AppFormField({ name, label, width, ...otherProps }: AppFormFieldProps) {
    const {
        setFieldTouched,
        setFieldValue,
        errors,
        touched,
        values,
    } = useFormikContext<Record<string, any>>();

    return (
        <>
            <FloatingLabelInput
                label={label}
                onBlur={() => setFieldTouched(name)}
                onChangeText={(text) => setFieldValue(name, text)}
                value={values[name]}
                {...otherProps}
            />
            {/* <ErrorMessage error={errors[name]} visible={touched[name]} /> */}
        </>
    );
}

export default AppFormField;
