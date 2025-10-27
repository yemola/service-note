import { useFormikContext } from "formik";
import { Pressable } from 'react-native';
import { IconSymbol } from "../ui/IconSymbol";


export default function SubmitButtionIcon() {
    const { handleSubmit } = useFormikContext();

    return (
        <Pressable onPress={() => handleSubmit()} style={{ padding: 6 }}>
            <IconSymbol name='chevron.down' size={30} color='gray' weight='bold' />
        </Pressable>
    )

}