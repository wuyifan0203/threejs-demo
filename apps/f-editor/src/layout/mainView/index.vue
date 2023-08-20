<template>
  <div class="wraper">
    <div class="tab"> this is Main Vue</div>
    <main id="CAD">
      <div id="main-view"></div>
      <div id="depuly-view"></div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { store } from "@/store";
export default defineComponent({
  name: 'MainView',
  components: {},
  props: [],
  setup() {
    onMounted(() => {
      console.log("mounted");
      store.cadStore.setupCAD();

    })
    return {

    }
  }
})
</script>
<style scoped lang="scss">
.wraper {
  display: flex;
  flex-direction: column;
  height: 100%;

  .tab {
    height: 25px;
  }

  #CAD {
    flex-grow: 1;
    background-color: aqua;

    #main-view {
      height: 100%;
      width: 100%;
      position: relative;
      background-color: greenyellow;
    }
  }

}
</style>