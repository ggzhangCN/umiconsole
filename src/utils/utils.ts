import { parse } from 'querystring';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

export const getBreadcrumb = (path: string, routes: any) => {
  const list: { name: string; path: string }[] = [];

  if (path === '/') return list;

  const splicingBreadcrumb = (
    pathName: string,
    routeList: any[],
    infoList: { name: string; path: string }[],
  ) => {
    routeList.forEach((item) => {
      const pathReg = new RegExp(`^${item.path}`);
      if (item.path !== '/' && pathReg.test(pathName)) {
        list.push({ name: item.name, path: item.path });
      }
      if (item.children?.length) {
        splicingBreadcrumb(pathName, item.children, infoList);
      }
    });
  };

  splicingBreadcrumb(path, routes, list);

  return list;
};

// 通过path获取路由名称
export function getRouteName(key, query, routeList) {
  if (query?.name) return query.name;
  let routeName = '';
  const loopRoutes = (path, routes = routeList) => {
    for (let i = 0, len = routes.length; i < len; i++) {
      if (routes[i].path) {
        if (routes[i].path === path || `${routes[i].path}/` === path) {
          routeName = routes[i].name;
          if (query) routeName += `-${query[Object.keys(query)[0]]}`;
        }
        if (routes[i].path.includes(':')) {
          const pathId = path.replace(routes[i].path.split(':')[0], '');
          if (!pathId.includes('/')) {
            routeName = `${routes[i].name}-${pathId}`;
          }
        }
      }
      if (routeName) break;
      if (routes[i].routes) loopRoutes(path, routes[i].routes);
    }
  };
  loopRoutes(key);
  return routeName || '404';
}

// 通过path获取model名称
export function getRouteNamespace(key, query, routeList) {
  let namespace = '';

  const loopRoutes = (path, routes = routeList) => {
    for (let i = 0, len = routes.length; i < len; i++) {
      if (routes[i].path) {
        if (routes[i].path === path) {
          // eslint-disable-next-line prefer-destructuring
          namespace = routes[i].namespace || null;
          if (namespace && namespace.includes(':') && query) {
            const id = namespace.split(':')[1];
            namespace = namespace.replace(id, query[id]);
          }
        }
        if (routes[i].path.includes(':')) {
          const pathId = path.replace(routes[i].path.split(':')[0], '');
          if (!pathId.includes('/')) {
            namespace = routes[i].namespace ? routes[i].namespace.replace(':id', `:${pathId}`) : '';
          }
        }
      }
      if (namespace) break;
      if (routes[i].routes) loopRoutes(path, routes[i].routes);
    }
  };
  loopRoutes(key);

  return namespace;
}

function handlePath(path) {
  if (/\/$/.test(path)) {
    path = path.slice(0, path.length - 1);
  }
  return path;
}

// 获取首页路由地址
export function getNextRoute(menuRoutes, index) {
  if (!menuRoutes[index]) return '';

  const route = menuRoutes[index];

  if (route.hideInMenu) return getNextRoute(menuRoutes, index + 1);
  if (!route.authority) {
    if (route.routes && !route.noChild) {
      const childPath = getNextRoute(route.routes, 0);
      if (childPath) return handlePath(childPath);
      return getNextRoute(menuRoutes, index + 1);
    }
    return handlePath(route.path);
  }
  const authorities = getAuthority();
  const every = route.authority.every((item) => authorities.includes(item));
  if (every) {
    if (route.routes && !route.noChild) {
      return getNextRoute(route.routes, 0);
    }
    return handlePath(route.path);
  }

  return getNextRoute(menuRoutes, index + 1);
}
