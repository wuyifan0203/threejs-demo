/*
 * @Date: 2023-08-02 09:24:27
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-01 13:10:25
 * @FilePath: /threejs-demo/apps/f-editor/src/use/useRelation/useParent.ts
 */
import {
  ref,
  inject,
  computed,
  onUnmounted,
  getCurrentInstance
} from 'vue';

export function useParent(key) {
  const parent:any = inject(key);
  if (parent) {
    const instance = getCurrentInstance();
    const { link, unlink, internalChildren } = parent;

    link(instance);
    onUnmounted(() => unlink(instance));

    const index = computed(() => internalChildren.indexOf(instance));

    return {
      parent,
      index
    };
  }

  return {
    parent: null,
    index: ref(-1)
  };
}
