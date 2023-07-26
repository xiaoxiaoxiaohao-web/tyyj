<script lang="ts" setup>
import { h, ref } from 'vue';
import { MailOutlined, AppstoreOutlined, SettingOutlined, PieChartOutlined } from '@ant-design/icons-vue';
import { MenuProps } from 'ant-design-vue';
const current = ref<string[]>(['mail']);
const items:any = ref<MenuProps['items']>([
  {
    key: 'mail',
    icon: () => h(MailOutlined),
    label: '理货采集总包',
    title: '理货采集总包',
  },
  {
    key: 'app',
    icon: () => h(PieChartOutlined),
    label: 'Navigation Two',
    title: 'Navigation Two',
  },
  {
    key: 'sub1',
    icon: () => h(SettingOutlined),
    label: 'Navigation Three - Submenu',
    title: 'Navigation Three - Submenu',
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          {
            label: 'Option 1',
            key: 'setting:1',
          },
          {
            label: 'Option 2',
            key: 'setting:2',
          },
        ],
      },
      {
        type: 'group',
        label: 'Item 2',
        children: [
          {
            label: 'Option 3',
            key: 'setting:3',
          },
          {
            label: 'Option 4',
            key: 'setting:4',
          },
        ],
      },
    ],
  }
]);
</script>

<template>
    <div class="index">
        <header>
            <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" />
        </header>
        <main>
          <router-view></router-view>
        </main>
    </div>
</template>


<style scoped>
main {
  margin-top: 20px;
}
</style>
