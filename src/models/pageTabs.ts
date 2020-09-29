import { Subscription, Effect, Reducer } from 'umi';

export interface TabInfo {
  closable: boolean;
  key: string;
  name: string;
  reloadType?: string;
  namespace?: string;
}

export interface PageTabsModelState {
  collapsed: boolean;
  currentPlayingWaveId: string;
  pageTab: {
    tabList: TabInfo[];
    activeTab: string;
  };
  routes: any[];
}

export interface PageTabsModelType {
  namespace: 'pageTabs';
  state: PageTabsModelState;
  effects: {
    setCurrentPlayingWaveId: Effect;
    changeLayoutCollapsed: Effect;
    setPageTabList: Effect;
    setPageActiveTab: Effect;
    // reloadPage: Effect;
    setPageReloadHandle: Effect;
    replacePathname: Effect;
    resetPageModel: Effect;
  };
  reducers: {
    updateCollapsed: Reducer<PageTabsModelState>;
    updateCurrentPlayingWaveId: Reducer<PageTabsModelState>;
    updatePageTab: Reducer<PageTabsModelState>;
    updateRoute: Reducer<PageTabsModelState>;
  };
  subscriptions: {
    setup: Subscription;
    setupRequestCancel: Subscription;
  };
}

const PageTabsModel: PageTabsModelType = {
  namespace: 'pageTabs',

  state: {
    collapsed: false,
    currentPlayingWaveId: '',
    pageTab: {
      tabList: [],
      activeTab: '/home',
    },
    routes: [],
  },

  effects: {
    *setCurrentPlayingWaveId({ payload }, { put }) {
      yield put({
        type: 'updateCurrentPlayingWaveId',
        payload,
      });
    },
    *changeLayoutCollapsed({ payload }, { put }) {
      yield put({
        type: 'updateCollapsed',
        payload,
      });
      yield put({ type: 'home/refreshAllData' });
    },
    *setPageTabList({ payload }, { put }) {
      yield put({
        type: 'updatePageTab',
        payload: { tabList: payload },
      });
    },
    *setPageActiveTab({ payload }, { put }) {
      yield put({
        type: 'updatePageTab',
        payload: { activeTab: payload },
      });
    },
    *setPageReloadHandle({ payload: { tab, type } }, { put, select }) {
      const {
        pageTab: { tabList },
      } = yield select((state: any) => state.pageTabs);
      const newTabList = tabList.map((item: any) => {
        if (item.key === tab) {
          return {
            ...item,
            reloadType: type,
          };
        }
        return item;
      });
      yield put({ type: 'updatePageTab', payload: { tabList: newTabList } });
    },
    *resetPageModel({ payload }, { put }) {
      const { namespace, refresh } = payload;
      const resetHandle = refresh ? 'init' : 'reset';
      let modelName = namespace;
      let id = null;
      if (namespace.includes(':')) {
        modelName = namespace.split(':').shift();
        id = namespace
          .split(':')
          .splice(1, namespace.split(':').length - 1)
          .join(':');
      }
      yield put({
        type: `${modelName}/${resetHandle}`,
        payload: { refresh, id },
      });
    },
    // *reloadPage({ payload }, { put }) {
    //   yield put({ type: payload });
    // },
    *replacePathname({ payload }, { put, select }) {
      const {
        pageTab: { tabList },
      } = yield select((state: any) => state.pageTabs);
      const newTabList = tabList.filter(
        (item) => !(item.key.includes('?') && item.key.split('?')[0] === payload),
      );
      yield put({ type: 'updatePageTab', payload: { tabList: newTabList } });
    },
  },

  reducers: {
    updateCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    updateCurrentPlayingWaveId(state, { payload }) {
      return {
        ...state,
        currentPlayingWaveId: payload.id,
      };
    },
    updatePageTab(state, { payload }) {
      return {
        ...state,
        pageTab: { ...state.pageTab, ...payload },
      };
    },
    updateRoute(state, { payload }) {
      state.routes = payload.routes;
    },
  },

  subscriptions: {
    setup({ history }): void {
      history.listen(({ pathname, search }): void => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
    setupRequestCancel({ history }) {
      history.listen(() => {
        // const { cancelRequest = new Map() } = window;
        // cancelRequest.forEach((value, key) => {
        //   if (value.pathname !== window.location.pathname) {
        //     value.cancel('CANCEL_REQUEST_MESSAGE');
        //     cancelRequest.delete(key);
        //   }
        // });
      });
    },
  },
};

export default PageTabsModel;
