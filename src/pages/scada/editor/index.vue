<template>
    <div ref="root" style="padding: 0;margin: 0;width: 100vw; height: 100vh;">
        <SJEditor :initOptions="initOptions"/>
    </div>
</template>

<script setup name="EditorPage">

import SJEditor from '@/components/editor/index.vue'

const { proxy } = getCurrentInstance();
const route = useRoute();

const initOptions = ref({});

function createdInit(){
    initOptions.value = Object.assign({
        chromeless: false,
    }, route.query);
}
createdInit();

function removeBeforeUnloadListener() {
  window.removeEventListener('beforeunload', beforeUnloadHandler);
}

function beforeUnloadHandler(event) {
  event.preventDefault();
  event.returnValue = '';
}
</script>

<style scoped>

</style>
