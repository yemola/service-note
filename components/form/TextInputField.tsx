import { TextInput, TextInputProps } from 'react-native';
import { FormikValues, useFormikContext } from "formik";

interface TextFieldProp<T> extends TextInputProps {
    name: keyof T;
}

export default function TextInputField<T extends FormikValues>({ name, ...otherProps }: TextFieldProp<T>) {
    const { setFieldTouched, setFieldValue, values } = useFormikContext<T>();

    return (
        <TextInput
            onBlur={() => setFieldTouched(name as string)}
            onChangeText={(text) => setFieldValue(name as string, text)}
            value={values[name] as string}
            {...otherProps}
        />
    )
}