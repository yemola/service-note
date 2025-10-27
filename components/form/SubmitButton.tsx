import React from "react";
import { useFormikContext } from "formik";
import Button from "../Button";

export type SubmitButtonProp = {
    title: string;
};

function SubmitButton({ title }: SubmitButtonProp) {
    const { handleSubmit } = useFormikContext() || {};

    if (!handleSubmit) {
        throw new Error("SubmitButton must be used within a Formik context.");
    }

    return <Button title={title} onPress={handleSubmit} />;
}

export default SubmitButton;
