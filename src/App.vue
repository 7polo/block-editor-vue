<template>
  <div style="padding: 0 100px 0 100px">
    <button @click="changeContent">切换</button>
    <button @click="changeState">切换状态</button>
    <button @click="readOnly = !readOnly">{{readOnly}}</button>
    <div>{{ state }}</div>
    <div>{{ readOnly }}</div>
    <div>{{ count }}</div>
    <div>
      {{ content.blocks }}
    </div>
    <div @click="close=true">关闭</div>

    <block-editor
        v-if="!close"
        v-model:readOnly="readOnly"
        v-model:state="state"
        v-model:content="content"
        :plugins="plugins"
        @change="onChange"
        @message="onMessage"
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
    const state = ref(STATE.READY)

    const content = ref({
      "time": 1632326526488,
      "blocks": [{
        'id': 'a',
        'blockId': 'a1',
        "type": "paragraph",
        "data": {
          "text": 211
        }
      }, {
        'id': 'b',
        'blockId': 'b1',
        "type": "image",
        "data": {
          // "url": "https://codex.so/public/app/img/external/codex2x.png",
          "url": "http://file.apologizebao.cn/jnote/other/i1o.png",
          // "url": "http://file.apologizebao.cn/jnote/other/io.png",
          "withBorder": false,
          "stretched": false,
          "withBackground": false
        }
      }, {
        'id': 'c',
        'blockId': 'c1',
        "type": 'code',
        "data": {
          "code": "123123123"
        }
      }, {
        'id': 'd',
        'blockId': 'd3',
        "type": 'link',
        "data": {
          "link": "https://www.processon.com/embed/5d006c43e4b071ad5a206ed2",
          meta: {
            height: 300
          }
        }
      }],
      "version": "2.20.2"
    })

    watch(state, (n) => {
      // console.log("state:" + n)
    })

    const onChange = (type, target) => {
      // console.log(type)
      // console.log(target)
    }

    const count = ref(0)

    const changeContent = () => {
      count.value++;

      content.value = {
        "time": 1632326526488,
        "blocks": [{
          "type": "paragraph",
          'id': 'b',
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

    const onMessage = (msg) => {
      console.log(msg)
    }

    const close = ref(false)
    return {
      close,
      readOnly,
      state,
      content,
      plugins,
      count,
      changeContent,
      changeState,
      onChange,
      onMessage
    }
  }
});
</script>

<style lang="less" scoped>

</style>
