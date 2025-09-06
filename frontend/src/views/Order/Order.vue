<template>
    <div>
        <a-alert
            v-if="isErr"
            :message="t('message.dataFail')"
            type="error"
            show-icon
            id="msg"
        />
        <div class="tags">
            <a-tabs v-model:activeKey="activeKey" @change="change">
                <a-tab-pane key="0" :tab="t('message.pending')"></a-tab-pane>
                <a-tab-pane key="1" :tab="t('message.unfinished')"></a-tab-pane>
                <a-tab-pane key="2" :tab="t('message.completed')"></a-tab-pane>
            </a-tabs>
        </div>
        <a-empty v-if="res.length == 0"/>
        <div class="card" v-else v-for="(item, index) in res" @click="orderIndex(index)">
            <div class="header">
                {{item.ORDER_ID}}
                <a-button ghost @click="edit(index)" v-if="per == 0 && item.PD == 0">{{ $t('message.edit') }}</a-button>
            </div>
            <div class="bottomo">
                <img :src="item.GOOD_INFO.IMG_URL" alt="" class="left">
                <div class="right">
                    <div class="title">
                        {{item.GOOD_INFO.NAME}}
                    </div>
                    <div class="content">
                        {{item.GOOD_INFO.INTRODUCTION}}
                    </div>
                    <div class="price">
                        ￥{{item.TOTAL_PRICE}}
                    </div>
                    <div class="center">
                        <div class="consignee">
                            <div class="tit">
                                {{ $t('message.consignee') }}: 
                            </div>
                            <div class="content">
                                <div>{{ $t('message.theName') }}: {{item.NAME}}</div>
                                <div>{{ $t('message.phoneNumber') }}: {{item.PHONE}}</div>
                                <div>{{ $t('message.address') }}: {{item.ADDRESS}}</div>
                            </div>
                        </div>
                        <div class="pay" v-if="per == 0">
                            <a-button
                                type="primary"
                                danger
                                size="large"
                                v-if="activeKey == 0"
                                @click="pay"
                            >{{ $t('message.pay') }}</a-button>
                            <a-button
                                type="primary"
                                size="large"
                                v-if="activeKey == 1"
                                @click="get"
                            >{{ $t('message.confirmReceipt') }}</a-button>
                        </div>
                        <div class="pay" v-if="per == 1">
                            <a-button
                                type="primary"
                                size="large"
                                v-if="activeKey != 2"
                                @click="editS(index)"
                            >{{ $t('message.manage') }}</a-button>
                        </div>
                    </div>
                    <div class="info">
                        <div>{{ $t('message.quantity') }}: {{item.COUNT}} {{ $t('message.seller') }}: {{item.GOOD_INFO.UPLOADER_ID}}</div>
                        <div>{{ $t('message.message') }}: {{item.LEAVE_COMMENT}}</div>
                    </div>
                </div>
            </div>
            <div class="PD">
                <div class="step">
                    <a-steps :current="item.PD" size="small">
                        <a-step :title="t('message.ordered')" />
                        <a-step :title="t('message.waitShipment')" />
                        <a-step :title="t('message.inTransit')" />
                        <a-step :title="t('message.received')" />
                    </a-steps>
                </div>
                <div class="info" v-if="item.EMS">
                    {{ $t('message.trackingNumber') }}: {{item.EMS}}
                </div>
            </div>
            <div class="footer">
                <div class="items">
                    <div class="item">{{ $t('message.seller') }}: {{item.SELLER_ID}}</div>
                </div>
                <div class="items">
                    <div v-if="item.CREATED_BY == -1" class="item">{{ $t('message.systemImplantation') }}</div>
                    <div v-else class="item">{{ $t('message.creator') }}: {{item.CREATED_BY}}</div>
                    <div class="item">{{time[index]}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
import { reactive, ref, toRefs } from '@vue/reactivity';
import { createVNode } from 'vue';
import { postAPI } from "../../utils/api";
import store from '@/store';
import {fullDate} from "../../components/date";
import router from '@/router';
import { jwtDecode } from "jwt-decode";
import Cookie from 'js-cookie';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
export default {
    setup() {
        const { t } = useI18n();
        // 选择标签
        var activeKey = ref('0');
        // 权限
        var per = ref(jwtDecode(Cookie.get('token')).Permission);
        function change(){
            getData();
        }
        var isErr = ref(false);
        var List = reactive({
            res: []
        });
        var timeList = reactive({
            time: []
        });
        const getData = async () => {
            var form = {};
            var id;
            var postUrl;
            var item;
            if(per.value == 2) {
                postUrl = '/admin/getOrders';
                if(activeKey.value == '0') {
                    form = {
                        PD: 0
                    }
                }else if(activeKey.value == '2') {
                    form = {
                        PD: 3
                    }
                }else {
                    form = {
                        $or: [
                            {
                                PD: 1
                            },
                            {
                                PD: 2
                            }
                        ]
                    }
                }
            }else {
                if (per.value == 0) {
                    id = store.state.userForm.USER_ID;
                    postUrl = '/buyr/getOrders';
                    item = 'USER_ID';
                }else if(per.value == 1) {
                    id = store.state.userForm.SELLER_ID;
                    postUrl = '/seller/getOrders';
                    item = 'SELLER_ID';
                }
                if(activeKey.value == '0') {
                    form = {
                        [item]: id,
                        PD: 0
                    }
                }else if(activeKey.value == '2') {
                    form = {
                        [item]: id,
                        PD: 3
                    }
                }else {
                    form = {
                        [item]: id,
                        $or: [
                            {
                                PD: 1
                            },
                            {
                                PD: 2
                            }
                        ]
                    }
                }
            }
            await postAPI(postUrl, form).then(result => {
                console.log("result", result);
                if (result.status == 200) {
                    List.res = result.data;
                    timeList.time = [];
                    for(let i = 0; i < List.res.length; i++) {
                        timeList.time.push(fullDate(List.res[i].CREATED_TIME));
                    }
                } else {
                    isErr.value = true;
                    setTimeout(() => {
                        isErr.value = false;
                    }, 2000);
                }
            });
        }
        getData();
        // 编辑
        function edit(index) {
            var params = List.res[index]
            let routeData = router.resolve({
                path: "/home/orderinfo",
                query: params
            });
            router.push(routeData.href)
        }
        function editS(index) {
            var params = List.res[index]
            let routeData = router.resolve({
                path: "/home/orderinfos",
                query: params
            });
            router.push(routeData.href)
        }
        // 订单编号
        var indexOrder = ref();
        function orderIndex(index) {
            indexOrder.value = index
        }
        // 支付
        const pay = () => {
            Modal.confirm({
                title: t('message.pay'),
                icon: createVNode(ExclamationCircleOutlined),
                content: t('message.paymentSuc'),
                okText: t('message.confirm'),
                cancelText: t('message.cancel'),
                onOk: () => {
                    postAPI('/buyr/payOrder', {
                        ORDER_ID: List.res[indexOrder.value].ORDER_ID
                    }).then(res => {
                        if (res.status == 200) {
                            message.success(t('message.submitSuc'));
                            setTimeout(() => {
                                router.go(0);
                            }, 2000);
                        } else {
                            isErr.value = true;
                            setTimeout(() => {
                                isErr.value = false;
                            }, 2000);
                        }
                    })
                },
                onCancel() {},
            });
        }
        function get() {
            Modal.confirm({
                title: t('message.confirmReceipt'),
                icon: createVNode(ExclamationCircleOutlined),
                content: t('message.receiptSuc'),
                okText: t('message.confirm'),
                cancelText: t('message.cancel'),
                onOk: () => {
                    postAPI('/buyr/getGood', {
                        ORDER_ID: List.res[indexOrder.value].ORDER_ID
                    }).then(res => {
                        if (res.status == 200) {
                            message.success(t('message.submitSuc'));
                            setTimeout(() => {
                                router.go(0);
                            }, 2000);
                        } else {
                            isErr.value = true;
                            setTimeout(() => {
                                isErr.value = false;
                            }, 2000);
                        }
                    })
                }
            });
        }
        return {
            orderIndex,
            indexOrder,
            pay,
            get,
            per,
            activeKey,
            ...toRefs(List),
            isErr,
            ...toRefs(timeList),
            change,
            edit,
            editS,
            t
        }
    }
}
</script>

<style scoped>
@import url('./Order.css');
</style>