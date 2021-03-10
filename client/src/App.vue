<template>
  <div id="app">
    <!-- <settings-component :settingsProperty="settingsObject" /> -->
    <!-- <sources :streams.sync="streams" /> -->

    <b-sidebar bg-variant="dark" :width="sidebarWidth" visible no-header>
      <div class="mx-0 my-5">
        <b-button block squared variant="primary" v-b-toggle.settings-collapse>
          <b-icon :class="{ 'float-left': isExpanded }" icon="card-list" />
          <span v-if="isExpanded"> SETTINGS</span>
        </b-button>
        <b-collapse id="settings-collapse" class="p-2">
          <div class="text-white"></div>
        </b-collapse>

        <b-button block squared variant="primary" v-b-toggle.sources-collapse>
          <b-icon :class="{ 'float-left': isExpanded }" icon="box-arrow-in-right" />
          <span v-if="isExpanded"> SOURCES</span>
        </b-button>
        <b-collapse id="sources-collapse" class="p-2">
          <div class="text-white"></div>
        </b-collapse>

        <b-button block squared variant="primary">
          <b-icon :class="{ 'float-left': isExpanded }" icon="broadcast-pin" />
          <span v-if="isExpanded"> BROADCAST</span>
        </b-button>
      </div>

      <template #footer="{ hide }">
        <b-button block squared variant="primary" @click="() => (isExpanded = !isExpanded)">
          <b-icon :icon="`chevron-double-${isExpanded ? 'left' : 'right'}`" />
        </b-button>
      </template>
    </b-sidebar>

    <!-- Stage -->
    <div id="stage" class="d-flex justify-content-center align-items-center h-100" @mouseleave="">
      <div id="sketch" ref="sketchTemplate" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, Ref } from '@vue/composition-api';
import SettingsComponent from './components/Settings.vue';
import Stage from './components/Stage.vue';
import Sources from './components/Sources.vue';
import msgpack from '@ygoe/msgpack';
import useStage from './hooks/useStage';

export default defineComponent({
  components: {
    SettingsComponent,
    Stage,
    Sources,
  },

  setup(props, { root }) {
    const sketchTemplate: Ref<HTMLElement | undefined> = ref(undefined);
    const streams = ref([]);
    const settingsObject: Ref<Object | undefined> = ref(undefined);

    onMounted(() => {
      // stage stuff
      const body = {};
      const { target } = useStage(sketchTemplate.value, body);

      // ws stuff
      const port = 5080;
      const isSecure = false;

      //@ts-ignore
      root.$ws.onopen = function() {
        /** we are expecting arraybuffers, data wrapped into bytes */
        //@ts-ignore
        root.$ws.binaryType = 'arraybuffer';
        /**
         * we are using msgpack to serialize
         * and deserialize data and send as bytes, string
         * formated data is ignored on the server.
         */
        // root.$ws.send(msgpack.serialize({ address: '...', args: { id: '...' } }),); /** OK */
        // root.$ws.send({ register: 'abc', id: 123 }); /** IGNORED */
      };

      /** incoming messages are received here, we expect
       * bytes and not strings. data is deserialised with
       * the msgpack library by https://github.com/ygoe/msgpack.js
       * and must be included locally (on the server).
       */
      //@ts-ignore
      root.$ws.onmessage = function(ev) {
        const packet = msgpack.deserialize(ev.data);
        const { address, args } = packet;
        switch (address) {
          case 'pn':
            args.forEach(el => {
              target(el);
            });
            break;

          case 'settings':
            settingsObject.value = args;
            console.log(args.general);
            // document.getElementById('settings-label').innerHTML = args.label;
            // document.getElementById('settings-json').innerHTML = JSON.stringify(args.broadcast, null, 2);
            break;

          case 'sources':
            streams.value = args;
            break;
        }
      };
    });

    const isExpanded = ref(false);
    const sidebarWidth = computed(() => (isExpanded.value ? '300px' : '100px'));
    const sidebar = {
      isExpanded,
      sidebarWidth,
    };

    return {
      streams,
      sketchTemplate,
      settingsObject,

      ...sidebar,
    };
  },
});
</script>

<style lang="scss">
@import 'assets/scss/custom.scss';

#stage {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
  background-color: black;

  #sketch {
    width: 99%;
    height: 99%;

    background-color: black;
  }
}
</style>
