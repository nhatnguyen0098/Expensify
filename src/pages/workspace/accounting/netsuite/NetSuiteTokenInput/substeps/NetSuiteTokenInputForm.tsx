import React, {useCallback} from 'react';
import {View} from 'react-native';
import {ExpensiMark} from 'expensify-common';
import TextInput from '@components/TextInput';
import Text from '@components/Text';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import INPUT_IDS from '@src/types/form/NetSuiteTokenInputForm';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ErrorUtils from '@libs/ErrorUtils';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import CONST from '@src/CONST';
import {connectPolicyToNetSuite} from '@libs/actions/connections/NetSuiteCommands';
import RenderHTML from '@components/RenderHTML';

const parser = new ExpensiMark();

function NetSuiteTokenInputForm({onNext, policyID}: SubStepProps & {policyID: string}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const formInputs = Object.values(INPUT_IDS);

    const validate = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM> = {};

            formInputs.forEach((formInput) => {
                if (formValues[formInput]) {
                    return;
                }
                ErrorUtils.addErrorMessage(errors, formInput, translate('common.error.fieldRequired'));
            });
            return errors;
        },
        [formInputs, translate],
    );

    const connectPolicy = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM>) => {
            connectPolicyToNetSuite(policyID, formValues);
            onNext();
        },
        [onNext, policyID],
    );

    return (
        <View style={[styles.flexGrow1, styles.ph5]}>
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.title`)}</Text>

            <FormProvider
                formID={ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM}
                style={styles.flexGrow1}
                validate={validate}
                onSubmit={connectPolicy}
                submitButtonText={translate('common.confirm')}
                enabledWhenOffline
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                {formInputs.map((formInput) => (
                    <View
                        style={styles.mb4}
                        key={formInput}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={formInput}
                            label={translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.${formInput}`)}
                            aria-label={translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.${formInput}`)}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                        />
                        {formInput === INPUT_IDS.ACCOUNT_ID && (
                            <View style={styles.pt2}>
                                <RenderHTML html={`<comment><muted-text>${parser.replace(translate(`workspace.netsuite.tokenInput.formSteps.enterCredentials.${formInput}Description`))}</muted-text></comment>`} />
                            </View>
                        )}
                    </View>
                ))}
            </FormProvider>
        </View>
    );
}

NetSuiteTokenInputForm.displayName = 'NetSuiteTokenInputForm';
export default NetSuiteTokenInputForm;
