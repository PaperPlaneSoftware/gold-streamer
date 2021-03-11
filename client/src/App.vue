<template>
  <div id="app">
    <!-- -------- SIDEBAR -------- -->
    <b-sidebar bg-variant="dark my-sidebar" :width="sidebarWidth" visible no-header-close>
      <template #header="">
        <h4 class="mx-auto">💃🕺</h4>
      </template>
      <div class="mx-0 my-5">
        <b-button block squared variant="primary" v-b-toggle.settings-collapse>
          <b-icon :class="{ 'float-left': isSidebarExpanded }" icon="card-list" />
          <span v-if="isSidebarExpanded"> SETTINGS</span>
        </b-button>
        <b-collapse id="settings-collapse" class="p-2" v-model="isSettingsExpanded">
          <div class="text-white">
            <settings v-show="isSettingsExpanded" :settings="settingsObject" />
          </div>
        </b-collapse>

        <b-button block squared variant="primary" v-b-toggle.sources-collapse>
          <b-icon :class="{ 'float-left': isSidebarExpanded }" icon="box-arrow-in-right" />
          <span v-if="isSidebarExpanded"> SOURCES</span>
        </b-button>
        <b-collapse id="sources-collapse" class="p-2" v-model="isSourcesExpanded">
          <div class="text-white">
            <sources v-show="isSourcesExpanded" :streams.sync="streams" />
          </div>
        </b-collapse>

        <b-button block squared variant="primary" v-b-toggle.broadcast-collapse>
          <b-icon :class="{ 'float-left': isSidebarExpanded }" icon="broadcast-pin" />
          <span v-if="isSidebarExpanded"> BROADCAST</span>
        </b-button>
        <b-collapse id="broadcast-collapse" class="p-2" v-model="isBroadcastExpanded">
          <div class="text-white"></div>
        </b-collapse>
      </div>

      <template #footer="{ hide }">
        <b-button block squared variant="primary" @click="toggleSidebar">
          <b-icon :icon="`chevron-double-${isSidebarExpanded ? 'left' : 'right'}`" />
        </b-button>
      </template>
    </b-sidebar>

    <!-- -------- STAGE -------- -->
    <div id="stage" class="d-flex justify-content-center align-items-center h-100">
      <div id="sketch" ref="sketchTemplate" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, Ref } from '@vue/composition-api';
import Settings from './components/Settings.vue';
import Sources from './components/Sources.vue';
import msgpack from '@ygoe/msgpack';
import useStage from './hooks/useStage';

export default defineComponent({
  components: {
    Settings,
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
            args.forEach(target);
            break;

          case 'settings':
            settingsObject.value = args;
            break;

          case 'sources':
            streams.value = args;
            break;
        }
      };
    });

    const isSidebarExpanded = computed(() => {
      return isSettingsExpanded.value || isSourcesExpanded.value || isBroadcastExpanded.value;
    });
    const isSettingsExpanded = ref(false);
    const isSourcesExpanded = ref(false);
    const isBroadcastExpanded = ref(false);

    const sidebarWidth = computed(() => (isSidebarExpanded.value ? '300px' : '100px'));
    function toggleSidebar() {
      if (isSidebarExpanded.value) {
        isSettingsExpanded.value = false;
        isSourcesExpanded.value = false;
        isBroadcastExpanded.value = false;
      } else {
        isSourcesExpanded.value = true;
      }
    }

    const sidebar = {
      isSidebarExpanded,
      isSettingsExpanded,
      isSourcesExpanded,
      isBroadcastExpanded,
      sidebarWidth,
      toggleSidebar,
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

.my-sidebar {
  border-right: 2px solid $secondary;
}
</style>
