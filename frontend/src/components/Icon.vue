<template>
    <shopping-outlined v-if="id == 1"/>
    <user-outlined v-if="id == 2"/>
    <audit-outlined v-if="id == 3"/>
    <file-text-outlined v-if="id == 4"/>
    <file-search-outlined v-if="id == 5"/>
    <user-switch-outlined v-if="id == 6"/>
    <user-outlined v-if="id == 7"/>
    <idcard-outlined v-if="id == 8"/>
    <bar-chart-outlined v-if="id == 9"/>
    
    <!-- <profile-outlined v-if="id == 7"/> -->
</template>

<script>
import { IdcardOutlined, UserOutlined, FileSearchOutlined, ShoppingOutlined, ProfileOutlined, UserSwitchOutlined, FileTextOutlined, AuditOutlined, BarChartOutlined } from '@ant-design/icons-vue';
import { toRefs } from '@vue/reactivity';
export default {
    props: [
        "id"
    ],
    components: {
        IdcardOutlined,
        UserOutlined,
        FileSearchOutlined,
        ShoppingOutlined,
        ProfileOutlined,
        UserSwitchOutlined,
        FileTextOutlined,
        AuditOutlined,
        BarChartOutlined
    },
    setup(props) {
        return {
            ...toRefs(props)
        }
    }
}
</script>