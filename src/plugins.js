import Image from '../../block-editor-plugins/editorjs-image/src';
import Code from '../../block-editor-plugins/editorjs-code/src';
// import DragDrop from '../../../plugin/dragdrop/src/'
// import Minder from '../../../plugin/minder/src/'
import Undo from 'editorjs-undo';
import header from '@editorjs/header';
import list from '@editorjs/nested-list';
import table from 'editorjs-table';
import Alert from 'editorjs-alert';
import {unsplashJson} from './unsplash-json';

export const plugins = {
    // code: Code,
    // paragraph: paragraph,
    // minder: Minder,

    // quote: require('@editorjs/quote'),
    header: header,
    list: {
        class: list,
        inlineToolbar: true,
    },
    // embed: require('@editorjs/embed'),
    // marker: require('@editorjs/marker'),
    // underline: require('@editorjs/underline'),
    // delimiter: require('@editorjs/delimiter'),
    // checklist: require('@editorjs/checklist'),

    table: table,
    Alert: Alert,
    code: Code,
    // code: require('@7polo/editorjs-code'),
    image: {
        // class: require('@7polo/editorjs-image'),
        class: Image,
        config: {
            unsplash: {
                search: ()=> {
                    return new Promise(function(resolve){
                        resolve(unsplashJson);
                    })
                }
            },
            upload: {
                doUpload: ()=> {
                    return new Promise(function(resolve){
                        resolve({url: 'http://file.apologizebao.cn/jnote/other/io.png'});
                    })
                }
            }
        }
    }
};
