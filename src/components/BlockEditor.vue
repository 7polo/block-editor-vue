<template>
  <div class="block-editor" :id="editor.id"></div>
</template>
<script>

import {STATE, EVENT_TYPES} from './constant'

import {defineComponent, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {nanoid} from "nanoid";
import {useVModel} from "@vueuse/core";
import EditorJS from '@7polo/editorjs';


export default defineComponent({
  props: {
    readOnly: {
      type: Boolean,
      required: false,
      default: false
    },
    state: {
      type: String,
      required: true,
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
        return {
          tools: {}
        }
      }
    }
  },
  setup(props, {emit, expose}) {

    const editor = {
      id: 'editor_' + nanoid(5),
      lock: false,
      ref: null
    }

    const record = {
      requestId: 0,
      renderId: 0
    }

    const content = ref(props.content)
    watch(() => props.content, (newValue) => {
      content.value = newValue
      // 如果渲染id没变说明是同一篇
      if (content.value._renderId === record.renderId) {
        return
      }
      record.requestId++;
      createEditor()
    })

    const state = useVModel(props, 'state', emit)
    const setState = (newState) => {
      state.value = newState
    }
    const getState = () => {
      return state.value
    }
    watch(state, (v) => {
      // console.log('watch')
      if (v === STATE.READY) {
        if (record.requestId === record.renderId) {
          return;
        }
        createEditor()
      }
    });

    watch(() => props.readOnly, (readOnly) => {
      // console.log('readOnly')
      if (editor.ref) {
        editor.ref.readOnly.toggle()
      }
    })

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
      // console.log('destroy editor')
      let editorRef = editor.ref
      if (!editorRef) {
        console.warn('editor [ref] is not valid')
        return
      }
      if (typeof editorRef.destroy == 'function') {
        editorRef.destroy();
      } else {
        console.warn('editor [destroy] is not function')
      }
    }

    const createEditor = () => {
      // console.log('createEditor:' + getState() + ":" + editor.lock)
      const requestId = record.requestId
      if (editor.lock) {
        return
      }
      editor.lock = true
      setState(STATE.LOADING)
      const editorData = JSON.parse(JSON.stringify(content.value || {blocks: []}))
      destroyEditor();
      const command = props.plugins.command;
      editor.ref = new EditorJS({
        logLevel: 'ERROR',
        readOnly: props.readOnly,
        autofocus: true,
        holder: editor.id,
        tools: Object.assign({}, props.plugins?.tools),
        data: editorData,
        onBeforeKeydown(event) {
          if (command) {
            return !command.onKeyUp(event)
          }
        },
        onMessage(op) {
          emit('message', op)
        },
        onReady() {
          if (command) {
            command.bindEditor(editor.ref)
          }
          // 渲染完成后
          setTimeout(() => {
            // console.log('ready')
            editor.lock = false
            setState(STATE.READY)
            record.renderId = requestId
            emit('ready', editor.ref, editorData)
          }, 500)
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
    });

    onUnmounted(()=> {
      destroyEditor()
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
