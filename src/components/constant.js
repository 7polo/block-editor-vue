export const STATE = {
    NONE: 'NONE',     // 编辑器未初始化
    READY: 'READY',    // 编辑器就绪
    LOADING: 'LOADING',  // 编辑器加入数据中
    MODIFIED: 'MODIFIED',   // 编辑器发生修改
    SAVING: 'SAVING'    // 编辑保存中
}

export const EVENT_TYPES = {
    'block-added': 'added',
    'block-changed': 'updated',
    'block-removed': 'removed'
}
