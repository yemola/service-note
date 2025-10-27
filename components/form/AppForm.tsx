import React from "react";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { Formik, FormikHelpers } from "formik";

export type AppFormProps<TValues extends object> = PropsWithChildren<{
    initialValues: TValues;
    onSubmit: (values: TValues, helpers: FormikHelpers<TValues>) => void;
    validationSchema?: any; // 👈 Made optional
    children: ReactNode;
}>;

const AppForm = <TValues extends object>({
    initialValues,
    onSubmit,
    validationSchema, // 👈 This is now optional
    children,
}: AppFormProps<TValues>): ReactElement => {
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema || undefined} // 👈 Allows omitting validation
        >
            {() => <>{children}</>}
        </Formik>
    );
};

export default AppForm;
