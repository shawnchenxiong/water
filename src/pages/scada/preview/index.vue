<template>
    <div style="padding: 0;margin: 0;width: 100vw; height: 100vh;overflow: hidden;">
        <SJEditor :initOptions="initOptions" :previewMode="true"/>
    </div>
</template>

<script  setup name="PreviewPage">

import SJEditor from '@/components/editor/index.vue'

const { proxy } = getCurrentInstance();
const route = useRoute();

const initOptions = ref({});

function createdInit(){
    initOptions.value = Object.assign({
        chromeless: true,
    }, route.query);
}
createdInit();
</script>

<style scoped>

.a1 {
    border-bottom: 1px solid red;
    position: absolute;
    width: 100px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    top: 0px;
    left: calc(50% - 50px);

    width: 100%;
    height: 1px;
    position: absolute;
    background-color: #ECECEC;
    margin-top: 10px;
    overflow-y: scroll;

    flex-direction: row;
    justify-content: flex-end;
    align-items: center;

    text-align: center;
    line-height: 300px;
    position: relative;
    position: absolute;
    display: flex;
    flex-wrap: wrap;

    display: flex;
    flex-direction: column;

    display: flex;
    flex-direction: row;
}

</style>
