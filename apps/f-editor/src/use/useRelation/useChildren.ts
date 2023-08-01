/*
 * @Author: wuyifan wuyifan@max-optics.com
 * @Date: 2022-06-07 13:48:48
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-05-24 20:48:57
 * @FilePath: /dragable/src/use/useRelation/useChildren.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  isVNode,
  provide,
  reactive,
  getCurrentInstance
} from 'vue';

function flattenVNode(children:any) {
  const result:any[] = [];

  const traverse = (children:any) => {
    if (!Array.isArray(children)) return;

    children.forEach(child => {
      if (!isVNode(child)) return;
      result.push(child);

      if (child.component?.subTree) {
        result.push(child.component?.subTree);
        traverse(child.component.subTree.children);
      }

      if (child.children) {
        traverse(child.children);
      }
    });
  };

  traverse(children);

  return result;
}

const sortChildren = (parent:any, publicChildren:any, internalChildren:any) => {
  const vnodes = flattenVNode(parent.subTree.children);

  internalChildren.sort(
    (a:any, b:any) => vnodes.indexOf(a.vnode) - vnodes.indexOf(b.vnode)
  );

  const orderedPublicChildren = internalChildren.map((item:any) => item.proxy);

  publicChildren.sort((a:any, b:any) => {
    const indexA = orderedPublicChildren.indexOf(a);
    const indexB = orderedPublicChildren.indexOf(b);
    return indexA - indexB;
  });
};

export function useChildren(key:any) {
  const publicChildren:any[] = reactive([]);
  const internalChildren:any[] = reactive([]);
  const parent = getCurrentInstance();

  const linkChildren = (value:any) => {
    const link = (child:any) => {
      if (child.proxy) {
        internalChildren.push(child);
        publicChildren.push(child.proxy);
        sortChildren(parent, publicChildren, internalChildren);
      }
    };

    const unlink = (child:any) => {
      const index = internalChildren.indexOf(child);
      publicChildren.splice(index, 1);
      internalChildren.splice(index, 1);
    };

    provide(
      key,
      Object.assign(
        {
          link,
          unlink,
          child: publicChildren,
          internalChildren
        },
        value
      )
    );
  };
  return {
    children: publicChildren,
    linkChildren
  };
}
