<template>
  <div class="block-editor" :id="editor.id"></div>
</template>
<script>

import {STATE, EVENT_TYPES} from './constant'

import {defineComponent, onMounted, reactive, ref, watch} from 'vue';
// import EditorJS from '@editorjs/editorjs'
import EditorJS from '../../../../editor.js/dist/editor'
import {nanoid} from "nanoid";

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
        return {}
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
  setup(props, {emit}) {

    const editor = reactive({
      id: 'editor_' + new Date().getTime(),
      ref: null,
      editState: STATE.NONE
    })

    const content = ref(props.content)

    watch(() => props.content, (newValue) => {
      console.log("init editor")
      createEditor(newValue)
    })

    watch(() => props.state, (state) => {
      editor.editState = state
    })

    watch(() => editor.editState, (state) => {
      emit('update:state', state)
    })

    const onEdit = (type, index, editBlock) => {
      const blocks = content.value.blocks || []
      const block = blocks[index]

      // 兼容
      editBlock.type = editBlock.tool

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

      emit('change', content.value, {
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

    const generateBlockId = ()=> {
      content.value?.blocks.forEach(block => {
        block.id = nanoid(10)
      })
    }

    let renderCount = 0;
    const createEditor = (data) => {
      renderCount++;
      content.value = data
      if (editor.editState === STATE.LOADING) {
        return
      }
      editor.editState = STATE.LOADING
      destroyEditor();
      generateBlockId()
      const editorData = JSON.parse(JSON.stringify(content.value || {blocks: []}))
      editor.ref = new EditorJS({
        logLevel: 'ERROR',
        readOnly: props.readOnly,
        autofocus: true,
        holder: editor.id,
        tools: props.plugins,
        data: editorData,
        onReady() {
          editor.editState = STATE.READY
          emit('ready', editor.ref, editorData)

          // 重新渲染
          renderCount--;
          if (renderCount > 0) {
            renderCount = 0
            createEditor(content.value)
          }
        },
        onChange: function (api, {detail, type}) {
          if (!EVENT_TYPES[type]) {
            return
          }
          const lastState = editor.editState
          editor.editState = STATE.MODIFIED
          const {target, index} = detail;
          target.save().then(data => {
            onEdit(EVENT_TYPES[type], index, data)
          }).catch((e) => {
            console.log(e)
            editor.editState = lastState
          })
        }
      });
    }

    onMounted(() => {
      createEditor(content.value)
    })

    return {
      editor
    }
  }
});
</script>

<style lang="less" scoped>

</style>
