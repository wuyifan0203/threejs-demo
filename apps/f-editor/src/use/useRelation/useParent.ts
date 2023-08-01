import {
  ref,
  inject,
  computed,
  onUnmounted,
  getCurrentInstance
} from 'vue';

export function useParent(key) {
  const parent = inject(key);
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
