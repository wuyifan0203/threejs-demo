/*
 * @Date: 2023-06-09 09:22:25
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-06-09 11:23:37
 * @FilePath: /dragable/src/config/layout.ts
 */
import content1 from '../component/content/content1.vue'
import {markRaw,defineAsyncComponent} from 'vue'
export const layoutConfig = {
    root: {
      type: 'column',
      content: [
        {
          type: 'row',
          content: [
            {
              type: 'stack',
              content: [
                {
                  type: 'component',
                  content: [],
                  size: 1,
                  sizeUnit: 'fr',
                  minSizeUnit: 'px',
                  id: '',
                  maximised: false,
                  isClosable: true, // 控制是否允许关闭
                  reorderEnabled: true,
                  title: 'Objects Tree',
                  header: {
                    show: 'top',
                    popout: false,
                    maximise: false,
                  },
                  componentType: 'objectTree',
                  componentState: {
                    refId: 3,
                  },
                },
              ],
              size: 18.181818181818183,
              sizeUnit: '%',
              minSizeUnit: 'px',
              id: '',
              isClosable: true,
              maximised: false,
              activeItemIndex: 0,
            },
            {
              type: 'stack',
              content: [
                {
                  type: 'component',
                  content: [],
                  size: 1,
                  sizeUnit: 'fr',
                  minSizeUnit: 'px',
                  id: '',
                  maximised: false,
                  isClosable: false,
                  reorderEnabled: false,
                  title: 'cad',
                  header: {
                    show: false,
                    popout: false,
                    maximise: false,
                  },
                  componentType: 'cad',
                  componentState: {
                    abc: 123,
                    refId: 4,
                  },
                },
              ],
              size: 63.63636363636363,
              sizeUnit: '%',
              minSizeUnit: 'px',
              header: {
                popout: false,
                maximise: false,
              },
              id: '123456',
              isClosable: true,
              maximised: false,
            },
            {
              type: 'column',
              content: [
                {
                  type: 'stack',
                  content: [
                    {
                      type: 'component',
                      content: [],
                      size: 10,
                      sizeUnit: '%',
                      minSizeUnit: 'px',
                      id: '',
                      maximised: false,
                      isClosable: true,
                      reorderEnabled: true,
                      title: 'Task Tree',
                      header: {
                        show: 'top',
                        popout: false,
                        maximise: false,
                      },
  
                      componentType: 'taskProgress',
                      componentState: {
                        refId: 5,
                      },
                    },
                  ],
                  size: 20.722378817471586,
                  sizeUnit: '%',
                  minSizeUnit: 'px',
                  id: '',
                  isClosable: true,
                  maximised: false,
                  activeItemIndex: 0,
                },
                {
                  type: 'stack',
                  content: [
                    {
                      type: 'component',
                      content: [],
                      size: 10,
                      sizeUnit: '%',
                      minSizeUnit: 'px',
                      id: '',
                      maximised: false,
                      isClosable: true,
                      reorderEnabled: true,
                      title: 'Historical Task',
                      header: {
                        show: 'top',
                        popout: false,
                        maximise: false,
                      },
                      componentType: 'taskList',
                      componentState: {
                        refId: 6,
                      },
                    },
                  ],
                  size: 79.27762118252839,
                  sizeUnit: '%',
                  minSizeUnit: 'px',
                  id: '',
                  isClosable: true,
                  maximised: false,
                  activeItemIndex: 0,
                },
                // {
                //   type: 'stack',
                //   content: [
                //     {
                //       type: 'component',
                //       content: [],
                //       size: 10,
                //       sizeUnit: '%',
                //       minSizeUnit: 'px',
                //       id: '',
                //       maximised: false,
                //       isClosable: true,
                //       reorderEnabled: true,
                //       title: 'Result View',
                //       header: {
                //         show: 'top',
                //         popout: false,
                //         maximise: false,
                //       },
                //       componentType: 'resultTree',
                //       componentState: {
                //         refId: 7,
                //       },
                //     },
                //   ],
                //   size: 40.13341213094269,
                //   sizeUnit: '%',
                //   minSizeUnit: 'px',
                //   id: '',
                //   isClosable: true,
                //   maximised: false,
                //   activeItemIndex: 0,
                // },
              ],
              size: 18.181818181818183,
              sizeUnit: '%',
              minSizeUnit: 'px',
              id: '',
              maximised: false,
              isClosable: true,
            },
            
          ],
          size: 71.71717171717171,
          sizeUnit: '%',
          minSizeUnit: 'px',
          isClosable: true,
          maximised: false,
          id: '',
        },
        {
          type: 'row',
          content: [
            {
              type: 'component',
              content: [],
              size: 52.6,
              sizeUnit: '%',
              minSizeUnit: 'px',
              id: '',
              maximised: false,
              isClosable: true,
              reorderEnabled: true,
              title: 'Global Parameters',
              header: {
                show: 'top',
                popout: false,
                maximise: false,
              },
              componentType: 'globalParameters',
              componentState: {
                abc: 123,
                refId: 1,
              },
            },
            {
              type: 'component',
              content: [],
              size: 47.5,
              sizeUnit: '%',
              minSizeUnit: 'px',
              id: '',
              maximised: false,
              isClosable: true,
              reorderEnabled: true,
              title: 'Message',
              header: {
                show: 'top',
                popout: false,
                maximise: false,
              },
              componentType: 'systemLog',
              componentState: {
                abc: 123,
                refId: 0,
              },
            },
          ],
          size: 28.28282828282828,
          sizeUnit: '%',
          minSizeUnit: 'px',
          id: '',
          isClosable: true,
          maximised: false,
          activeItemIndex: 0,
        },
      ],
      size: 1,
      sizeUnit: 'fr',
      minSizeUnit: 'px',
      id: '',
      header: {
        popout: false,
        maximise: false,
      },
      isClosable: true,
      maximised: false,
    },
    openPopouts: [],
    settings: {
      constrainDragToContainer: true,
      reorderEnabled: true,
      popoutWholeStack: false,
      blockedPopoutsThrowError: true,
      closePopoutsOnUnload: true,
      responsiveMode: 'none',
      tabOverlapAllowance: 0,
      reorderOnTabMenuClick: true,
      tabControlOffset: 10,
      popInOnClose: false,
      showCloseIcon: false,
    },
    dimensions: {
      borderWidth: 3,
      borderGrabWidth: 3,
      defaultMinItemHeight: 0,
      defaultMinItemHeightUnit: 'px',
      defaultMinItemWidth: 10,
      defaultMinItemWidthUnit: 'px',
      headerHeight: 26,
      dragProxyWidth: 300,
      dragProxyHeight: 200,
    },
    header: {
      show: 'top',
      popout: 'open in new window',
      dock: 'dock',
      close: 'close',
      maximise: 'maximise',
      minimise: 'minimise',
      tabDropdown: 'additional tabs',
    },
    resolved: true,
};

export const getSetting = (componentType)=>{

    return markRaw(defineAsyncComponent(
        () => import('../component/content/content1.vue'),
      )
    );


}
  