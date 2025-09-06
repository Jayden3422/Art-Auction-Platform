<template>
    <div class="signin">
        <a-form
            ref="formRef"
            name="custom-validation"
            :model="formState"
            :rules="rules"
            v-bind="layout"
            @finish="handleFinish"
            @finishFailed="handleFinishFailed"
        >
            <a-form-item
                :label="t('message.shipped')"
                name="PD"
            >
                <a-switch checkedValue="2" unCheckedChildren="1" v-model:checked="formState.PD" />
            </a-form-item>
            <a-form-item :label="t('message.trackingNumber')" name="EMS">
                <a-input
                    v-model:value="formState.EMS"
                    autocomplete="off"
                />
            </a-form-item>
            <a-form-item has-feedback :label="t('message.verification')" name="age">
                <a-input-number v-model:value="formState.age" />
                <div @click="refreshCode" style="cursor: pointer">
                    <Identify v-model:identifyCode="identifyCode"></Identify>
                </div>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
                <a-button type="primary" html-type="submit">{{ $t('message.renew') }}</a-button>
                <a-button style="margin-left: 10px" @click="resetForm">
                    {{ $t('message.reset') }}
                </a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
import { defineComponent, reactive, ref } from "vue";
import judge from "../../components/judge";
import Identify from "../../components/Identify.vue";
import { postAPI } from "../../utils/api";
import { useRoute } from "vue-router";
import store from "@/store";
import router from "@/router";
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
export default defineComponent({
    components: {
        Identify,
    },
    setup() {
        const { t } = useI18n();
        var info = useRoute().query;
        const formRef = ref();
        const formState = reactive({
            ORDER_ID: parseInt(info.ORDER_ID),
            USER_ID: parseInt(info.USER_ID),
            PD: parseInt(info.PD),
            EMS: info.EMS,
            UPDATED_BY: store.state.userForm.SELLER_ID,
            age: ''
        });
        let checkAge = async (_rule, value) => {
            if (!value) {
                return Promise.reject(t('message.enterVerification'));
            }
            if (!Number.isInteger(value)) {
                return Promise.reject(t('message.enterNumber'));
            }
            if (value != identifyCode.value) {
                return Promise.reject(t('message.enterRightVerification'));
            } else {
                return Promise.resolve();
            }
        };
        const rules = {
            age: [
                {
                    validator: checkAge,
                    trigger: "change",
                },
            ],
        };
        const layout = {
            labelCol: {
                span: 4,
            },
            wrapperCol: {
                span: 14,
            },
        };
        // 通知标签
        const handleFinish = (values) => {
            postAPI("/seller/updateOrder", formState).then((res) => {
                if (res.status == 200) {
                    message.success(t('message.sendSuc'));
                    setTimeout(() => {
                        router.go(-1);
                    }, 2000);
                } else {
                    message.error(t('message.sendFail'));
                }
            });
        };
        const handleFinishFailed = (errors) => {
            console.log(errors);
        };
        const resetForm = () => {
            formRef.value.resetFields();
        };
        // 验证码
        var identifyCode = reactive({
            value: "",
        });
        // 验证码规则
        var identifyCodes = "0123456789";
        // 切换验证码
        function refreshCode() {
            identifyCode.value = "";
            makeCode(4);
        }
        refreshCode();
        // 生成随机验证码
        function makeCode(l) {
            for (let i = 0; i < l; i++) {
                identifyCode.value +=
                    identifyCodes[
                        Math.floor(
                            Math.random() * (identifyCodes.length - 0) + 0
                        )
                    ];
            }
        }
        return {
            info,
            formState,
            formRef,
            rules,
            layout,
            handleFinishFailed,
            handleFinish,
            resetForm,
            // 验证码
            identifyCode,
            identifyCodes,
            refreshCode,
            makeCode,
            t
        };
    },
});
</script>

<style scoped>
@import url("./OrderInfoS.css");
</style>