import { Tooltip, Tag, Breadcrumb } from 'antd';
import { Settings as ProSettings, BasicLayoutProps } from '@ant-design/pro-layout';
import { QuestionCircleOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import React from 'react';
import { connect, ConnectProps, SelectLang, useLocation } from 'umi';
import { ConnectState } from '@/models/connect';
import { getBreadcrumb } from '@/utils/utils';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export interface GlobalHeaderProps extends Partial<ConnectProps>, Partial<ProSettings> {
  theme?: ProSettings['navTheme'] | 'realDark';
  onCollapse: (collapsed: boolean) => void;
  collapsed?: boolean;
  route: BasicLayoutProps['route'];
}

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeader: React.SFC<GlobalHeaderProps> = (props) => {
  const { theme, layout, collapsed, onCollapse, route } = props;
  let className = styles.header;

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.header}  ${styles.dark}`;
  }

  const currentPath = useLocation().pathname
  const routeList = route?.routes || []
  const breadcrumbInfoList = getBreadcrumb(currentPath, routeList)

  return (
    <div className={className}>
      <div className={styles.leftContent}>
        <div className={styles.fold}>
          {collapsed ? (
            <MenuUnfoldOutlined onClick={() => onCollapse(false)} />
          ) : (
            <MenuFoldOutlined onClick={() => onCollapse(true)} />
          )}
        </div>
        <Breadcrumb>
          {
            breadcrumbInfoList.map(item =>
              <Breadcrumb.Item><a href={item.path}>{item.name}</a></Breadcrumb.Item>
            )
          }
        </Breadcrumb>
      </div>
      <div className={styles.rightContent}>
        <HeaderSearch
          className={`${styles.action} ${styles.search}`}
          placeholder="站内搜索"
          defaultValue="umi ui"
          options={[
            { label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>, value: 'umi ui' },
            {
              label: <a href="next.ant.design">Ant Design</a>,
              value: 'Ant Design',
            },
            {
              label: <a href="https://protable.ant.design/">Pro Table</a>,
              value: 'Pro Table',
            },
            {
              label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
              value: 'Pro Layout',
            },
          ]}
          // onSearch={value => {
          //   //console.log('input', value);
          // }}
        />
        <Tooltip title="使用文档">
          <a
            style={{
              color: 'inherit',
            }}
            target="_blank"
            href="https://pro.ant.design/docs/getting-started"
            rel="noopener noreferrer"
            className={styles.action}
          >
            <QuestionCircleOutlined />
          </a>
        </Tooltip>
        <Avatar />
        {REACT_APP_ENV && (
          <span>
            <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
          </span>
        )}
        <SelectLang className={styles.action} />
      </div>
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeader);
