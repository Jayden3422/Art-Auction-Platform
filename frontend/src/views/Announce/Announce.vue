<template>
    <div>
        <a-button type="primary" class="add" v-if="per == 2" @click="add">{{ $t('message.add') }}</a-button>
        <div class="card" v-for="(item, index) in res">
            <div class="header">
                {{item.ANNOUNCEMENT_ID}}
                <a-button ghost class="del" v-if="per == 2" @click="del(index)">{{ $t('message.del') }}</a-button>
            </div>
            <div class="bottomy">
                <div class="title">
                    {{item.TITLE}}
                </div>
                <div class="content">
                    {{item.CONTENT}}
                </div>
            </div>
            <div class="footer">
                <div>{{ $t('message.uploader') }}: {{item.UPLOADER_ID}}</div>
                <div>{{time[index]}}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { reactive, ref, toRefs } from '@vue/reactivity';
import { getAPI, postAPI } from "../../utils/api";
import {fullDate} from "../../components/date";
import { jwtDecode } from "jwt-decode";
import Cookie from 'js-cookie';
import router from '@/router';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
export default {
    setup() {
        const { t } = useI18n();
        var per = ref(jwtDecode(Cookie.get('token')).Permission);
        var List = reactive({
            res: []
        });
        var timeList = reactive({
            time: []
        });
        const getData = async () => {
            var result = await getAPI('/all/getAllAn');
            if (result.status == 200) {
                List.res = result.data;
                List.res.forEach((item) => {
                    timeList.time.push(fullDate(item.TIME));
                })
            } else {
                message.error(t('message.sendFail'));
            }
        }
        getData();
        function add() {
            router.push('/home/addannounce')
        }
        function del(index) {
            postAPI('/admin/delAn', {
                ANNOUNCEMENT_ID: List.res[index].ANNOUNCEMENT_ID
            }).then((res) => {
                if (res.status == 200) {
                    message.success(t('message.sendSuc'));
                    setTimeout(() => {
                        router.go(0);
                    }, 2000);
                } else {
                    message.error(t('message.sendFail'));
                }
            });
        }
        return {
            add,
            del,
            per,
            ...toRefs(List),
            ...toRefs(timeList),
            t
        }
    }
}
</script>

<style scoped>
@import url('./Announce.css');
</style>