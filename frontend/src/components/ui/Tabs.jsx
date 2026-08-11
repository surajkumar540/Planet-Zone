import { Tabs as AntdTabs } from "antd";

/**
 * Horizontal tab bar.
 *
 * Ant Design's Tabs handles the roving focus, arrow-key navigation and the
 * overflow menu that appears when the set is wider than its container — all
 * things the previous scrolling row left to the user to solve by dragging.
 *
 * The `tabs` contract is unchanged: `{ value, label, icon, count }`.
 */
const Tabs = ({ tabs, value, onChange, className }) => (
  <AntdTabs
    activeKey={value}
    onChange={onChange}
    className={className}
    items={tabs.map((tab) => ({
      key: tab.value,
      label: (
        <span className="flex items-center gap-2">
          {tab.icon && <tab.icon size={15} aria-hidden="true" />}
          {tab.label}
          {tab.count !== undefined && (
            <span className="rounded-full bg-surface-sunken px-1.5 py-0.5 text-caption text-content-muted">
              {tab.count}
            </span>
          )}
        </span>
      ),
    }))}
  />
);

export default Tabs;
