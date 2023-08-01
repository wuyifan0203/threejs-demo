<template>
  <div style="position: relative">
    <div ref="GLRoot" style="position: absolute; width: 100%; height: 100%">
      <!-- Root dom for Golden-Layout manager -->
    </div>
    <div style="position: absolute; width: 100%; height: 100%">
      <glComponent
        v-for="pair in AllComponents"
        :key="pair[0]"
        :ref="GlcKeyPrefix + pair[0]"
      >
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
import { getSetting } from "../../config/layout";
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
  setup(props,{expose}) {
    const GLRoot: Ref<null | HTMLElement> = ref(null);
    let GLayout: any;
    const GlcKeyPrefix = readonly(ref("glc_"));

    const MapComponents = new Map();
    const AllComponents = ref(new Map());
    const UnusedIndexes: any[] = [];

    let CurIndex = 0;
    let GlBoundingClientRect: any;

    const instance = getCurrentInstance();

    const addComponent = (componentType: string, title: string) => {
     const glc = getSetting(componentType)

      let index = CurIndex;

      if (UnusedIndexes.length > 0) index = UnusedIndexes.pop();
      else CurIndex++;

      AllComponents.value.set(index, glc);

      return index;
    };

    const addGLComponent = async (componentType: string, title: string) => {
      if (componentType.length == 0)
        throw new Error("addGLComponent: Component's type is empty");

      const index = addComponent(componentType, title);

      await nextTick(); // wait 1 tick for vue to add the dom

      GLayout.addComponent(componentType, { refId: index }, title);
    };

    const loadGLLayout = async (layoutConfig: object) => {
      GLayout.clear();
      AllComponents.value.clear();

      const config = layoutConfig.resolved
        ? LayoutConfig.fromResolved(layoutConfig)
        : layoutConfig;

      let contents = [config.root.content];

      let index = 0;
      while (contents.length > 0) {
        const content = contents.shift();
        for (let itemConfig of content) {
          if (itemConfig.type == "component") {
            index = addComponent(itemConfig.componentType, itemConfig.title);
            if (typeof itemConfig.componentState == "object")
              itemConfig.componentState["refId"] = index;
            else itemConfig.componentState = { refId: index };
          } else if (itemConfig.content.length > 0) {
            contents.push(itemConfig.content);
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

      const handleContainerVirtualVisibilityChangeRequiredEvent = (container,visible) => {
        const component = MapComponents.get(container);
        if (!component || !component?.glc) {
          throw new Error("handleContainerVirtualVisibilityChangeRequiredEvent: Component not found");
        }

        component.glc.setVisibility(visible);
      };

      const handleContainerVirtualZIndexChangeRequiredEvent = (container,logicalZIndex,defaultZIndex) => {
        const component = MapComponents.get(container);
        if (!component || !component?.glc) {
          throw new Error("handleContainerVirtualZIndexChangeRequiredEvent: Component not found");
        }

        component.glc.setZIndex(defaultZIndex);
      };

      const bindComponentEventListener = (container, itemConfig) => {
        let refId = -1;
        if (itemConfig && itemConfig.componentState) {
          console.log("itemConfig : ", itemConfig);
          refId = itemConfig.componentState.refId;
        } else {
          throw new Error("bindComponentEventListener: component's ref id is required");
        }

        console.log(instance);

        const ref = GlcKeyPrefix.value + refId;
        const component = instance.refs[ref][0];
        console.log(component);

        MapComponents.set(container, { refId: refId, glc: component });

        container.virtualRectingRequiredEvent = (container, width, height) =>
          handleContainerVirtualRectingRequiredEvent(container, width, height);

        container.virtualVisibilityChangeRequiredEvent = (container, visible) =>
          handleContainerVirtualVisibilityChangeRequiredEvent(container,visible);

        container.virtualZIndexChangeRequiredEvent = (container,logicalZIndex,defaultZIndex) =>
          handleContainerVirtualZIndexChangeRequiredEvent(container,logicalZIndex,defaultZIndex);

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
