<template>
  <div>
    <button @click="changeContent">切换</button>
    <button @click="changeState">切换状态</button>
    <div>{{ state }}</div>
    <div>{{ readOnly }}</div>
    <div>{{ count }}</div>
    <div>
      {{ content.blocks }}
    </div>

    <block-editor
        v-model:readOnly="readOnly"
        v-model:state="state"
        v-model:content="content"
        :plugins="plugins"
        @change="onChange"
    />
  </div>
</template>
<script>
import {defineComponent, ref, watch} from 'vue';
import BlockEditor from "./components/index";
import {STATE} from "./components/constant";
import {plugins} from './plugins'

export default defineComponent({
  components: {
    BlockEditor
  },
  setup() {

    const readOnly = ref(false)
    const state = ref(STATE.NONE)
    const content = ref({
      "time": 1632326526488,
      "blocks": [{
        'blockId': '1',
        "type": "paragraph",
        "data": {
          "text": 211
        }
      }/*, {
        "type": "image",
        "data": {
          "url": "https://codex.so/public/app/img/external/codex2x.png",
          "withBorder": false,
          "stretched": false,
          "withBackground": false
        }
      }*/, {
        "type": 'code',
        "data": {
          "code": "123123123"
        }
      }],
      "version": "2.20.2"
    })

    watch(state, (n) => {
      // console.log("state:" + n)
    })

    const onChange = (type, target) => {
      console.log(type)
      console.log(target)
    }

    const count = ref(0)

    const changeContent = () => {
      count.value++;

      content.value = {
        "time": 1632326526488,
        "blocks": [{
          "type": "paragraph",
          "data": {
            "text": "新" + count.value
          }
        }],
        "version": "2.20.2"
      }
    }

    const changeState = () => {
      state.value = STATE.READY
    }
    return {
      readOnly,
      state,
      content,
      plugins,

      count,
      changeContent,
      changeState,
      onChange
    }
  }
});
</script>

<style lang="less" scoped>

</style>
