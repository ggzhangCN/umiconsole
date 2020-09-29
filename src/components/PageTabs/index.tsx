import React, { useEffect } from 'react';
import { Tabs, Dropdown, Menu } from 'antd';
import { BasicLayoutProps } from '@ant-design/pro-layout';
import { connect, useHistory, useLocation, Dispatch } from 'umi';
import { CloseOutlined } from '@ant-design/icons';
import { TabInfo } from '@/models/pageTabs';
import { getRouteName, getRouteNamespace, getNextRoute } from '@/utils/utils';
import styles from './index.less';

const { TabPane } = Tabs;

const mapStateToProps = ({ pageTabs: { collapsed, pageTab }, settings }) => ({
  collapsed,
  tabList: pageTab.tabList,
  activeTab: pageTab.activeTab,
  settings,
});

const mapDispatchToProps = (dispatch) => ({
  setPageTabList: (list) => {
    dispatch({ type: 'pageTabs/setPageTabList', payload: list });
  },
  setPageActiveTab: (tab) => {
    dispatch({ type: 'pageTabs/setPageActiveTab', payload: tab });
  },
  reloadPage: (namespace) => {
    if (!namespace) return;
    dispatch({
      type: 'pageTabs/resetPageModel',
      payload: {
        namespace,
        refresh: true,
      },
    });
  },
  resetPageModel: (namespace) => {
    if (!namespace) return;
    dispatch({
      type: 'pageTabs/resetPageModel',
      payload: { namespace },
    });
  },
  setRoute: (routes) => {
    dispatch({
      type: 'pageTabs/updateRoute',
      payload: {
        routes,
      },
    });
  },
});

export interface Props {
  dispatch: Dispatch;
  tabList: TabInfo[];
  activeTab: string;
  setPageTabList: (list: TabInfo[]) => void;
  setPageActiveTab: (tab: string) => void;
  reloadPage: (type: string) => void;
  resetPageModel: (namespace: string) => void;
  collapsed: true;
  route: BasicLayoutProps['route'];
}

const PageTabs = (props: Props) => {
  const {
    collapsed,
    activeTab,
    tabList,
    setPageActiveTab,
    resetPageModel,
    setPageTabList,
    reloadPage,
    route,
  } = props;
  const routes = route?.routes || [];
  const menuRoutes = routes.slice(1, routes.length);
  const homeRoute = getNextRoute(menuRoutes, 0);
  const history = useHistory();
  const location = useLocation();

  const onPageTabChange = (key) => {
    history.push(key);
  };

  const onPageTabEdit = (targetKey, action) => {
    if (action !== 'remove') return;
    let editKeyIdx = 0;
    const tabs = [...tabList];
    tabs.forEach((item, index) => {
      item.key === targetKey && (editKeyIdx = index);
    });
    if (targetKey === activeTab) onPageTabChange(tabs[editKeyIdx - 1].key);
    const removeNs = tabs[editKeyIdx].namespace;
    resetPageModel(removeNs);
    tabs.splice(editKeyIdx, 1);
    setPageTabList(tabs);
  };

  const onTabMenuClick = (e, tab) => {
    e.domEvent && e.domEvent.stopPropagation();
    let tabs = [];
    switch (e.key) {
      case 'current': // 关闭当前
        onPageTabEdit(tab.key, 'remove');
        break;
      case 'others': // 关闭其他
        onPageTabChange(tab.key);
        tabs = [];
        tabList.forEach((item) => {
          if (item.closable && item.key !== tab.key) {
            resetPageModel(item.namespace);
          } else {
            tabs.push(item);
          }
        });

        setPageTabList(tabs);
        break;
      case 'all': // 关闭全部
        onPageTabChange(homeRoute);
        tabs = [];
        tabList.forEach((item) => {
          if (item.closable) {
            // 关闭的tab
            resetPageModel(item.namespace);
          } else {
            tabs.push(item);
          }
        });
        setPageTabList(tabs);
        break;
      case 'refresh': // 刷新
      default:
        reloadPage(tab.namespace);
        break;
    }
  };

  useEffect(() => {
    let path = location.pathname;
    if (!path || path === '/') return;
    let params = null;
    if (Object.keys(location.query).length) {
      params = location.query;
      const arr = [];
      Object.keys(params).forEach((item, idx) => {
        arr.push(`${item}=${Object.values(params)[idx]}`);
      });
      path += `?${arr.join('&')}`;
    }
    if (tabList.some((tab) => tab.key === path)) {
      setPageActiveTab(path);
    } else {
      const newTabList = [...tabList];
      if (location.pathname !== homeRoute && !tabList.some((tab) => tab.key === homeRoute)) {
        newTabList.unshift({
          closable: false,
          key: homeRoute,
          name: getRouteName(homeRoute, null, routes),
          namespace: getRouteNamespace(homeRoute, null, routes),
        });
      }
      newTabList.push({
        closable: location.pathname !== homeRoute,
        key: path,
        name: getRouteName(location.pathname, params, routes),
        namespace: getRouteNamespace(location.pathname, params, routes),
      });
      setPageActiveTab(path);
      setPageTabList(newTabList);
    }
  }, [location]);

  return (
    <Tabs
      className={styles.pageTabs}
      type="editable-card"
      hideAdd
      activeKey={activeTab}
      onChange={onPageTabChange}
      onEdit={onPageTabEdit}
      tabBarExtraContent={
        tabList.length > 1 && (
          <Dropdown
            overlay={
              <Menu
                onClick={(e) =>
                  onTabMenuClick(
                    e,
                    tabList.find((tab) => tab.key === activeTab),
                  )
                }
                className="pageTabMenu"
              >
                {activeTab !== homeRoute && tabList.length > 2 && (
                  <Menu.Item key="others">关闭其他标签页</Menu.Item>
                )}
                {tabList.length > 1 && <Menu.Item key="all">关闭全部标签页</Menu.Item>}
              </Menu>
            }
            trigger={['contextMenu']}
          >
            <div className="closeAllBtn" onClick={() => onTabMenuClick({ key: 'all' }, '')}>
              <CloseOutlined style={{ color: '#7A7A7A', fontSize: '16px' }} />
            </div>
          </Dropdown>
        )
      }
    >
      {tabList.map((item) => (
        <TabPane
          key={item.key}
          closable={item.closable}
          tab={
            <Dropdown
              overlay={
                <Menu onClick={(e) => onTabMenuClick(e, item)} className="pageTabMenu">
                  {activeTab === item.key && item.namespace && (
                    <Menu.Item key="refresh">刷新</Menu.Item>
                  )}
                  {item.closable && <Menu.Item key="current">关闭</Menu.Item>}
                  {item.key !== homeRoute && tabList.length > 2 && (
                    <Menu.Item key="others">关闭其他标签页</Menu.Item>
                  )}
                  {tabList.length > 1 && <Menu.Item key="all">关闭全部标签页</Menu.Item>}
                </Menu>
              }
              trigger={['contextMenu']}
            >
              <a className="ant-dropdown-link" href="#" onClick={(e) => e.preventDefault()}>
                {item.name}
              </a>
            </Dropdown>
          }
        />
      ))}
    </Tabs>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageTabs);
