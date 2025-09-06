<template>
  <div class="btns">
    <a-button type="primary" v-if="page" @click="pageChange">{{ $t('message.addBuyer') }}</a-button>
    <a-button type="primary" v-else @click="pageChange">{{ $t('message.return') }}</a-button>
  </div>
  <Suspense v-if="page">
    <template v-slot:default>
      <Table @run-parent="getChild" @reload="reload" v-if="isTable"></Table>
    </template>
    <template v-slot:fallback>
      <h3>{{ $t('message.wait') }}</h3>
    </template>
  </Suspense>
  <Suspense v-else>
    <template v-slot:default>
      <keep-alive>
        <AddUsers></AddUsers>
      </keep-alive>
    </template>
    <template v-slot:fallback>
      <h3>{{ $t('message.wait') }}</h3>
    </template>
  </Suspense>
</template>

<script>
import store from '@/store';
import { ref, defineAsyncComponent, nextTick } from 'vue';
const Table = defineAsyncComponent(()=>import('../../components/tableUsers.vue'))
const AddUsers = defineAsyncComponent(()=>import('../../components/addUsers.vue'))
export default {
  setup() {
    var isTable = ref(true)
    function reload() {
        isTable.value = false;
        nextTick(() => {
            isTable.value = true;
        }) 
    }
    let page = ref(true)
    function pageChange(){
      page.value = !page.value
      store.commit('isAddUser')
      store.commit('clearUser')
    }
    function getChild(data){
      page.value = data
    }
    return {
      page,
      pageChange,
      getChild,
      isTable,
      reload
    };
  },
  components:{
    Table,
    AddUsers
  }
};
</script>

<style scoped>
.btns{
  margin-bottom: 20px;
}
</style>