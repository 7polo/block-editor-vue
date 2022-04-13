<template>
  <div class="block-editor" :id="editor.id"></div>
</template>
<script>

import {STATE, EVENT_TYPES} from './constant'

import {defineComponent, nextTick, onMounted, ref, watch} from 'vue';
import EditorJS from '../../../editor.js/dist/editor'
import {CommandParagraph} from "../../../block-editor-plugins/paragraph/src/";
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
      default: STATE.READY
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

    const record = {
      requestId: 0,
      renderId: 0
    }

    const content = ref(props.content)
    watch(() => props.content, (newValue) => {
      // console.log('watch content....')
      record.requestId++;
      content.value = newValue

      // 如果渲染id没变说明是同一篇
      if (content.value._renderId === record.renderId) {
        return
      }
      createEditor()
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

      const currentIdx = blocks.findIndex(item => item.id === editBlock.id);
      if (type === EVENT_TYPES["block-added"]) {
        blocks.splice(index, 0, editBlock)
      }

      if (type === EVENT_TYPES["block-changed"]) {
        const block = blocks[currentIdx]
        Object.assign(block, editBlock)
      }

      if (type === EVENT_TYPES["block-removed"]) {
        blocks.splice(currentIdx, 1)
      }
      content.value._renderId = record.renderId
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

    watch(state, (v) => {
      if (v === STATE.READY) {
        if (record.requestId === record.renderId) {
          return;
        }
        // console.log('retry:' + JSON.stringify(record))
        createEditor()
      }
    })

    const createEditor = () => {
      const requestId = record.requestId
      if (getState() === STATE.LOADING) {
        // console.warn('not allow render this moment: ' + requestId + ' ' + record.renderId + '   ' + getState())
        return
      }

      const editorData = JSON.parse(JSON.stringify(content.value || {blocks: []}))
      setState(STATE.LOADING)
      destroyEditor();

      editor.ref = new EditorJS({
        logLevel: 'ERROR',
        readOnly: props.readOnly,
        autofocus: true,
        holder: editor.id,
        tools: Object.assign({
          paragraph: CommandParagraph(() => {
            return editor.ref
          })
        }, props.plugins),
        data: editorData,
        onMessage(op) {
          emit('message', op)
        },
        onReady() {
          // 渲染完成后
          setTimeout(() => {
            setState(STATE.READY)
            record.renderId = requestId
            // console.log('渲染完成:' + requestId + ' ' + getState())
            emit('ready', editor.ref, editorData)
          }, 1000)
        },
        onChange: function (api, {detail, type}) {
          if (detail.index === -1) {
            return;
          }
          if (!EVENT_TYPES[type]) {
            return
          }
          const lastState = getState()
          setState(STATE.MODIFIED)
          const {target, index} = detail;
          target.save().then(data => {
            // console.group(type)
            // console.log(detail)
            // console.log(data)
            // console.groupEnd()
            onEdit(EVENT_TYPES[type], index, data)
          }).catch(() => {
            setState(lastState)
          })
        }
      });
    }

    onMounted(() => {
      nextTick(() => createEditor(props.content))
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

<style lang="less">
@import "../styles/editor-beauty.less";
</style>
