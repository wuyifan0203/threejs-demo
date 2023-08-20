<template>
  <div style="position: relative">
    <div ref="GLRoot" style="position: absolute; width: 100%; height: 100%">
      <!-- Root dom for Golden-Layout manager -->
    </div>
    <div style="position: absolute; width: 100%; height: 100%">
      <glComponent v-for="pair in AllComponents" :key="pair[0]" :ref="GlcKeyPrefix + pair[0]">
        <component :is="pair[1]"></component>
      </glComponent>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineAsyncComponent,
  defineComponent,
  getCurrentInstance,
  markRaw,
  readonly,
  ref,
  nextTick,
  onMounted,
  Ref,
} from "vue";

import {
  ComponentContainer,
  LayoutConfig,
  RowOrColumnItemConfig,
  StackItemConfig,
  ComponentItemConfig,
  ResolvedComponentItemConfig,
  LogicalZIndex,
  VirtualLayout,
  ResolvedLayoutConfig,
  GoldenLayout,
} from "golden-layout";
import glComponent from "./glComponent.vue";
export default defineComponent({
  name: "GLayout",
  components: {
    glComponent
  },
  props: {
    glcPath: {
      type: String,
      default: "",
    },
  },
  setup(props, { expose }) {
    const GLRoot: Ref<null | HTMLElement> = ref(null);
    let GLayout: any;
    const GlcKeyPrefix = readonly(ref("glc_"));

    const MapComponents = new Map();
    const AllComponents = ref(new Map());
    const UnusedIndexes: any[] = [];

    let CurIndex = 0;
    let GlBoundingClientRect: any;

    const instance = getCurrentInstance();

    const getSetting = (componentType: string, componentMap: { [key: string]: any }) => {
      // 从映射对象中获取动态导入函数
      const importFn = componentMap[componentType];
      if (!importFn) {
        // 如果没有找到对应的动态导入函数，返回 null 或抛出错误
        return null;
      }
      // 使用动态导入函数来异步加载组件
      const glc = markRaw(defineAsyncComponent(importFn));
      return glc;
    };

    const addComponent = (componentType: string, title: string, componentMap: { [key: string]: any }) => {
      const glc = getSetting(componentType, componentMap)

      let index = CurIndex;

      if (UnusedIndexes.length > 0) index = UnusedIndexes.pop();
      else CurIndex++;

      AllComponents.value.set(index, glc);

      return index;
    };

    const addGLComponent = async (componentType: string, title: string, componentMap) => {
      if (componentType.length == 0)
        throw new Error("addGLComponent: Component's type is empty");

      const index = addComponent(componentType, title, componentMap);

      await nextTick(); // wait 1 tick for vue to add the dom

      GLayout.addComponent(componentType, { refId: index }, title);
    };

    type contentType =  RowOrColumnItemConfig[]| StackItemConfig[] | ComponentItemConfig[];

    const loadGLLayout = async (layoutConfig: (LayoutConfig | ResolvedLayoutConfig) & { resolved?: boolean }, componentMap) => {
      GLayout.clear();
      AllComponents.value.clear();

      const config = layoutConfig.resolved ? LayoutConfig.fromResolved(layoutConfig as ResolvedLayoutConfig) : layoutConfig;

      if (!config.root) {
        return;
      }

      let contents:(contentType)[] = [config.root.content] as any;

      let index = 0;
      while (contents.length > 0) {
        const content = contents.shift() as contentType;
        for (let itemConfig of content) {
          if (itemConfig.type == "component") {
            index = addComponent(itemConfig.componentType as string, itemConfig.title as string, componentMap);
            if (typeof itemConfig.componentState == "object")
            if(itemConfig.componentState){
              itemConfig.componentState["refId"] = index;
            }
            else itemConfig.componentState = { refId: index };
          } else if (itemConfig.content.length > 0) {
            contents.push(itemConfig.content as contentType);
          }
        }
      }

      await nextTick(); // wait 1 tick for vue to add the dom

      GLayout.loadLayout(config);
    };

    const getLayoutConfig = () => {
      return GLayout.saveLayout();
    };

    onMounted(() => {
      if (GLRoot.value == null)
        throw new Error("Golden Layout can't find the root DOM!");

      const onResize = () => {
        const dom = GLRoot.value as HTMLElement;
        let width = dom ? dom.offsetWidth : 0;
        let height = dom ? dom.offsetHeight : 0;
        GLayout.setSize(width, height);
      };

      window.addEventListener("resize", onResize, { passive: true });

      const handleBeforeVirtualRectingEvent = (count: any) => {
        GlBoundingClientRect = GLRoot.value!.getBoundingClientRect();
      };

      const handleContainerVirtualRectingRequiredEvent = (
        container: any,
        width: number,
        height: number
      ) => {
        const component = MapComponents.get(container);
        if (!component || !component?.glc) {
          throw new Error(
            "handleContainerVirtualRectingRequiredEvent: Component not found"
          );
        }

        const containerBoundingClientRect =
          container.element.getBoundingClientRect();
        const left =
          containerBoundingClientRect.left - GlBoundingClientRect.left;
        const top = containerBoundingClientRect.top - GlBoundingClientRect.top;
        component.glc.setPosAndSize(left, top, width, height);
      };

      const handleContainerVirtualVisibilityChangeRequiredEvent = (container, visible) => {
        const component = MapComponents.get(container);
        if (!component || !component?.glc) {
          throw new Error("handleContainerVirtualVisibilityChangeRequiredEvent: Component not found");
        }

        component.glc.setVisibility(visible);
      };

      const handleContainerVirtualZIndexChangeRequiredEvent = (container, logicalZIndex, defaultZIndex) => {
        const component = MapComponents.get(container);
        if (!component || !component?.glc) {
          throw new Error("handleContainerVirtualZIndexChangeRequiredEvent: Component not found");
        }

        component.glc.setZIndex(defaultZIndex);
      };

      const bindComponentEventListener = (container, itemConfig) => {
        let refId = -1;
        if (itemConfig && itemConfig.componentState) {
          // console.log("itemConfig : ", itemConfig);
          refId = itemConfig.componentState.refId;
        } else {
          throw new Error("bindComponentEventListener: component's ref id is required");
        }

        // console.log(instance);

        const ref = GlcKeyPrefix.value + refId;
        const component = (instance?.refs as any)[ref][0] as unknown as typeof glComponent;
        // console.log(component);

        MapComponents.set(container, { refId: refId, glc: component });

        container.virtualRectingRequiredEvent = (container, width, height) =>
          handleContainerVirtualRectingRequiredEvent(container, width, height);

        container.virtualVisibilityChangeRequiredEvent = (container, visible) =>
          handleContainerVirtualVisibilityChangeRequiredEvent(container, visible);

        container.virtualZIndexChangeRequiredEvent = (container, logicalZIndex, defaultZIndex) =>
          handleContainerVirtualZIndexChangeRequiredEvent(container, logicalZIndex, defaultZIndex);

        return {
          component,
          virtual: true,
        };
      };

      const unbindComponentEventListener = (container) => {
        const component = MapComponents.get(container);
        if (!component || !component?.glc) {
          throw new Error("handleUnbindComponentEvent: Component not found");
        }

        MapComponents.delete(container);
        AllComponents.value.delete(component.refId);
        UnusedIndexes.push(component.refId);
      };

      GLayout = new VirtualLayout(
        GLRoot.value,
        bindComponentEventListener,
        unbindComponentEventListener
      );


      GLayout.beforeVirtualRectingEvent = handleBeforeVirtualRectingEvent;
    });

    expose({
      addGLComponent,
      loadGLLayout,
      getLayoutConfig,
    });

    return {
      AllComponents,
      GLRoot,
      GlcKeyPrefix
    };
  },
});
</script>
