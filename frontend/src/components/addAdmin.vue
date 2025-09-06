<template>
    <div class="addUsers">
        <a-alert v-if="info" :message="t('message.submitSuc')" type="success" show-icon id="msg"/>
        <div class="form">
            <a-form
                :model="formState"
                name="basic"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                autocomplete="off"
                @finish="onFinish"
                @finishFailed="onFinishFailed"
            >
                <a-form-item
                :label="t('message.nickName')"
                :rules="[{ required: true, message: t('message.enterNickName') }]"
                >
                    <a-input v-model:value="formState.ADMIN_NAME" />
                </a-form-item>
                <a-form-item
                :label="t('message.phoneNumber')"
                :rules="[{ required: true, message: t('message.enterPhoneNumber') }]"
                >
                    <a-input v-model:value="formState.PHONE" />
                </a-form-item>
                <a-form-item
                :label="t('message.email')"
                :rules="[{ required: true, message: t('message.enterEmail') }]"
                >
                    <a-input v-model:value="formState.EMAIL" />
                </a-form-item>
                <a-form-item
                :label="t('message.avatarLink')"
                >
                    <a-input v-model:value="formState.AVATAR_URL" />
                </a-form-item>
                <a-form-item
                :label="t('message.password')"
                :rules="[{ required: true, message: t('message.enterPassword') }]"
                >
                    <a-input-password v-model:value="formState.ADMIN_PASS" />
                </a-form-item>

                <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-button v-if="isAdd" type="primary" html-type="submit">{{ $t('message.registerNew') }}</a-button>
                <a-button v-else type="primary" html-type="submit">{{ $t('message.updateUser') }}</a-button>
                </a-form-item>
            </a-form>
        </div>
    </div>
</template>
<script>
import store from '@/store';
import { reactive, ref } from 'vue';
const api = require('../utils/api')
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { t } = useI18n();
    var info = ref(false);
    var isAdd = ref(true);
    isAdd.value = store.state.isAddAdmin;
    var formState = reactive(store.state.adminForm);
    function refresh(){
        location.reload();
    }
    // 提交成功
    const onFinish = (values) => {
      console.log('Success:', values);
      isAdd.value = store.state.isAddAdmin
      if(isAdd.value == true){
        api.postAPI('/admin/postAdmin', formState)
            .then(
            (res) =>{
                if(res.status == 200){
                    info.value = true
                }
            })
            .catch(
            (err) =>{
                console.log(err)
            })
      }else{
        api.postAPI('/admin/updateAdmin', formState)
            .then(
            (res) =>{
                if(res.status == 200){
                    info.value = true
                }
            })
            .catch(
            (err) =>{
                console.log(err)
            })
      }
      setTimeout(() => {
          info.value = false
          refresh()
      }, 2000)
    };
    // 提交失败
    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };
    return {
      formState,
      onFinish,
      onFinishFailed,
      info,
      isAdd,
      t
    };
  },
};
</script>
<style scoped>
.form{
    width: 60vw;
}
#msg{
    margin: -110px auto;
    position: absolute;
    width: 80vw;
    z-index: 9;
}
</style>