<template>
  <div class="block-editor" :id="editor.id"></div>
</template>
<script>

import {STATE, EVENT_TYPES} from './constant'

import {defineComponent, onMounted, ref, watch} from 'vue';
import EditorJS from '../../../editor.js/dist/editor'
import {nanoid} from "nanoid";
import {useVModel} from "@vueuse/core";

export default defineComponent({
  props: {
    readOnly: {
      type: Boolean,
      required: false,
      default: false
    },
    state: {
      type: String,
      required: false,
      default: STATE.NONE
    },
    content: {
      type: Object,
      required: true,
      default() {
        return {
          blocks: []
        }
      }
    },
    plugins: {
      type: Object,
      required: false,
      default() {
        return {}
      }
    }
  },
  setup(props, {emit, expose}) {

    const editor = {
      id: 'editor_' + nanoid(5),
      ref: null
    }

    const content = ref(props.content)
    watch(() => props.content, (newValue) => {
      createEditor(newValue)
    })

    const state = useVModel(props, 'state', emit)
    const setState = (newState) => {
      state.value = newState
    }

    const getState = () => {
      return state.value
    }

    const onEdit = (type, index, editBlock) => {
      const old = JSON.parse(JSON.stringify(content.value))
      const blocks = content.value.blocks || []
      const block = blocks[index]

      if (type === EVENT_TYPES["block-added"]) {
        blocks.splice(index, 0, editBlock)
      }

      if (type === EVENT_TYPES["block-changed"]) {
        if (block?.id === editBlock.id) {
          Object.assign(block, editBlock)
        } else {
          blocks.splice(index, 0, editBlock)
        }
      }

      if (type === EVENT_TYPES["block-removed"]) {
        if (block?.id === editBlock.id) {
          blocks.splice(index, 1)
        }
      }

      emit('update:content', content.value)
      emit('change', content.value, old, {
        type: type,
        target: editBlock
      })
    }

    const destroyEditor = () => {
      let editorRef = editor.ref
      if (editorRef && typeof editorRef.destroy == 'function') {
        editorRef.destroy();
      }
    }

    const renderRecord = {
      id: 0,
      timer: null,
      readyTime: 0,
      isAllow: ()=> {
        // return new Date().getTime() - renderRecord.readyTime > 500;
        return true
      }
    }
    const createEditor = (data, retry = false) => {
      Object.assign(renderRecord, {id: nanoid()})
      if (!retry) {
        // 非重试的才记录
        content.value = data
      }
      if (getState() === STATE.LOADING || !renderRecord.isAllow()) {
        return
      }
      const renderId = renderRecord.id
      setState(STATE.LOADING)
      destroyEditor();
      // console.log("init editor")
      const editorData = JSON.parse(JSON.stringify(content.value || {blocks: []}))
      editor.ref = new EditorJS({
        logLevel: 'ERROR',
        readOnly: props.readOnly,
        autofocus: true,
        holder: editor.id,
        tools: props.plugins,
        data: editorData,
        onMessage(op){
          emit('message', op)
        },
        onReady() {
          setState(STATE.READY)
          emit('ready', editor.ref, editorData)
          renderRecord.readyTime = new Date().getTime();

          editor.ref.notifier.show = (options)=> {
            alert(JSON.stringify(options))
          }

          // 渲染的不是最新的， 重新渲染
          if (renderRecord.timer) {
            clearTimeout(renderRecord.timer)
          }
          renderRecord.timer = setTimeout(() => {
            if (renderRecord.id !== renderId) {
              renderRecord.timer = null
              createEditor(content.value, true)
            }
          }, 200)
        },
        onChange: function (api, {detail, type}) {
          if (!EVENT_TYPES[type]) {
            return
          }
          const lastState = getState()
          setState(STATE.MODIFIED)
          const {target, index} = detail;
          target.save().then(data => {
            onEdit(EVENT_TYPES[type], index, data)
          }).catch(() => {
            setState(lastState)
          })
        }
      });
    }

    onMounted(() => {
      createEditor(props.content)
    })

    /**
     * 同步更新block块的id
     * @param map
     */
    const syncBlockIds = (map) => {
      if (!Array.isArray(content.value.blocks)) {
        return
      }
      content.value.blocks.forEach(block => {
        const sign = block.id

        const blockId = map[block.id]
        if (blockId) {
          const blockData = editor.ref.blocks.getById(sign);
          if (blockData) {
            Object.assign(blockData, {blockId: blockId})
          }
          Object.assign(block, {blockId: blockId})
        }
      })
    }

    expose({
      syncBlockIds
    })

    return {
      editor
    }
  }
});
</script>

<style lang="less" scoped>

</style>
