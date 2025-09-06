<template>
    <a-button type="primary" @click="back" class="back">{{ $t('message.return') }}</a-button>
    <div class="signin">
        <a-form
            ref="formRef"
            name="custom-validation"
            :model="formState"
            :rules="rules"
            v-bind="layout"
            @finish="handleFinish"
            @validate="handleValidate"
            @finishFailed="handleFinishFailed"
        >
            <a-form-item
                :label="t('message.title')"
                name="TITLE"
                :rules="[{ required: true, message: t('message.enterTitle') }]"
            >
                <a-input v-model:value="formState.TITLE" />
            </a-form-item>
            <a-form-item
                :label="t('message.content')"
                name="CONTENT"
                :rules="[{ required: true, message: t('message.enterContent') }]"
            >
                <a-textarea v-model:value="formState.CONTENT" />
            </a-form-item>
            <a-form-item has-feedback :label="t('message.verification')" name="age">
                <a-input-number v-model:value="formState.age" />
                <div @click="refreshCode" style="cursor: pointer">
                    <Identify v-model:identifyCode="identifyCode"></Identify>
                </div>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
                <a-button type="primary" html-type="submit">{{ $t('message.add') }}</a-button>
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
import router from "@/router";
import store from "@/store";
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
export default defineComponent({
    components: {
        Identify,
    },
    setup() {
        const { t } = useI18n();
        const formRef = ref();
        const formState = reactive({
            UPLOADER_ID: store.state.userForm.ADMIN_ID,
            TITLE: "",
            CONTENT: "",
            age: null
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
            postAPI('/admin/addAn', formState).then((res) => {
                if (res.status == 200) {
                    message.success(t('message.sendSuc'));
                    setTimeout(() => {
                        router.back();
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
        function back() {
            router.back();
        }
        return {
            back,
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
@import url("./AddAnnounce.css");
</style>