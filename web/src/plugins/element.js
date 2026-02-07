import Vue from 'vue'
import {
  // 基础组件（高频使用）
  Button,
  Input,
  Select,
  Option,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Switch,
  // 表单组件
  Form,
  FormItem,
  // 数据展示
  Table,
  TableColumn,
  Tree,
  Pagination,
  Empty,
  Badge,
  Tag,
  Card,
  // 导航组件
  Menu,
  Submenu,
  MenuItem,
  Tabs,
  TabPane,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  // 反馈组件
  Dialog,
  Drawer,
  Message,
  MessageBox,
  Notification,
  Loading,
  Tooltip,
  Popover,
  // 布局组件
  Row,
  Col,
  Divider,
  Backtop,
  Scrollbar,
  Upload
} from 'element-ui'

// 注册组件
const components = [
  Button,
  Input,
  Select,
  Option,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Switch,
  Form,
  FormItem,
  Table,
  TableColumn,
  Tree,
  Pagination,
  Empty,
  Badge,
  Tag,
  Card,
  Menu,
  Submenu,
  MenuItem,
  Tabs,
  TabPane,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Dialog,
  Drawer,
  Tooltip,
  Popover,
  Row,
  Col,
  Divider,
  Backtop,
  Scrollbar,
  Upload
]

components.forEach(component => {
  Vue.component(component.name, component)
})

// 注册方法
Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
