<template>
  <Suspense>
    <router-view/>
  </Suspense>
</template>

<script setup>
import * as echarts from 'echarts'
import { provide } from 'vue'
provide('echarts', echarts)
</script>

<style>
</style>
